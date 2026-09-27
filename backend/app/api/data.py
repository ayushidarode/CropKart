"""
data.py - Agricultural Data Collection & Storage FastAPI Router

WHY THIS FILE EXISTS:
Allows users, schedulers, or administrators to trigger agricultural data collection
and verify system and storage health via clean REST API endpoints.

WHAT THIS FILE DOES:
- POST /api/data/collect: Triggers FETCH -> VALIDATE -> CLEAN -> NORMALIZE -> SUPABASE STORE.
- GET  /api/data/health: Checks if backend, data source, and Supabase are healthy.
- GET  /api/data/market-summary: Returns count of records, grains, and mandis stored.
- GET  /api/data/records: Lists recent stored market records.

WHAT GOES IN:
- HTTP requests (JSON body or query parameters).

WHAT COMES OUT:
- Standardized JSON responses (DataCollectResponse, DataHealthResponse, etc.).
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.models import AgriculturalMarketData, DataSource, Grain
    from app.schemas import (
        DataCollectRequest,
        DataCollectResponse,
        DataHealthResponse,
        DataStatusResponse,
        MarketDataRecordResponse,
        MarketDataSummaryResponse,
    )
    from app.services.data_ingestion_service import (
        DataIngestionService,
        data_ingestion_service,
    )
except ImportError:
    from database import get_db
    from models import AgriculturalMarketData, DataSource, Grain
    from schemas import (
        DataCollectRequest,
        DataCollectResponse,
        DataHealthResponse,
        DataStatusResponse,
        MarketDataRecordResponse,
        MarketDataSummaryResponse,
    )
    from services.data_ingestion_service import (
        DataIngestionService,
        data_ingestion_service,
    )

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/data",
    tags=["Agricultural Data Collection & Storage"]
)


def get_service() -> DataIngestionService:
    """Dependency provider for DataIngestionService."""
    return data_ingestion_service


@router.get(
    "/health",
    response_model=DataHealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check data pipeline and Supabase health",
    description="Verifies backend status, external agricultural data source reachability, and database connection."
)
async def check_data_health(
    service: DataIngestionService = Depends(get_service),
) -> DataHealthResponse:
    """
    Returns pipeline health status.
    - backend running: True
    - data_source_reachable: True/False
    - database_connected: True/False
    - supabase_configured: True/False
    """
    health = await service.check_health()
    return DataHealthResponse(**health)


@router.get(
    "/status",
    response_model=DataStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get agricultural data collection status",
    description="Returns source name, database target, total records stored, and latest record date."
)
async def get_data_status(
    service: DataIngestionService = Depends(get_service),
    db: Session = Depends(get_db),
) -> DataStatusResponse:
    """
    Returns pipeline status matching Section 17 requirements:
    {
      "source": "agmarknet_open_data",
      "database": "supabase",
      "records_stored": 1170,
      "latest_record_date": "2017-01-01"
    }
    """
    import os
    summary = service.get_market_summary(db=db)
    db_url = os.getenv("DATABASE_URL", "")
    supabase_configured = bool(
        os.getenv("SUPABASE_URL")
        or "supabase" in db_url.lower()
        or "pooler" in db_url.lower()
    )
    database_name = "supabase" if supabase_configured else ("postgresql" if "postgres" in db_url.lower() else "sqlite")

    source_row = db.query(DataSource).first()
    source_name = source_row.name if source_row else "agmarknet_open_data"

    commodities = [g[0] for g in db.query(Grain.name).distinct().all()]

    return DataStatusResponse(
        source=source_name,
        database=database_name,
        records_stored=summary["total_records"],
        latest_record_date=summary["latest_date"],
        commodities=commodities,
    )


@router.post(
    "/collect",
    response_model=DataCollectResponse,
    status_code=status.HTTP_200_OK,
    summary="Trigger agricultural data collection and Supabase storage",
    description="Fetches grain prices from external/government source, validates, cleans, and stores into Supabase."
)
async def collect_data(
    request: Optional[DataCollectRequest] = None,
    service: DataIngestionService = Depends(get_service),
    db: Session = Depends(get_db),
) -> DataCollectResponse:
    """
    Executes data collection pipeline.
    Does NOT fabricate data. Returns summary of fetched, valid, stored, and skipped records.
    """
    req = request or DataCollectRequest()
    try:
        result = await service.ingest_market_data(
            source_url=req.source_url,
            commodity=req.commodity or "Wheat",
            limit=req.limit or 100,
            db=db,
        )
        return DataCollectResponse(**result)
    except Exception as exc:
        logger.error(f"Error during data collection endpoint execution: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data collection failed: {str(exc)}"
        )


@router.get(
    "/market-summary",
    response_model=MarketDataSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get summary metrics of stored agricultural market data"
)
async def market_summary(
    service: DataIngestionService = Depends(get_service),
    db: Session = Depends(get_db),
) -> MarketDataSummaryResponse:
    """Returns total count of stored records, grains, and market locations in Supabase."""
    summary = service.get_market_summary(db=db)
    return MarketDataSummaryResponse(**summary)


@router.get(
    "/records",
    response_model=List[MarketDataRecordResponse],
    status_code=status.HTTP_200_OK,
    summary="List stored agricultural market records"
)
async def list_records(
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    commodity: Optional[str] = Query(None, description="Filter by commodity name"),
    db: Session = Depends(get_db),
) -> List[MarketDataRecordResponse]:
    """Retrieves stored records directly from Supabase PostgreSQL."""
    query = db.query(AgriculturalMarketData)
    if commodity:
        query = query.join(AgriculturalMarketData.grain).filter(
            AgriculturalMarketData.grain.has(name=commodity.title())
        )

    records = query.order_by(AgriculturalMarketData.record_date.desc()).limit(limit).all()

    output: List[MarketDataRecordResponse] = []
    for r in records:
        output.append(
            MarketDataRecordResponse(
                id=r.id,
                commodity=r.grain.name if r.grain else "Unknown",
                state=r.location.state if r.location else "Unknown",
                district=r.location.district if r.location else "Unknown",
                market=r.location.market if r.location else "Unknown",
                record_date=str(r.record_date),
                variety=r.variety,
                arrival_quantity=r.arrival_quantity,
                minimum_price=r.minimum_price,
                maximum_price=r.maximum_price,
                modal_price=r.modal_price,
            )
        )
    return output
