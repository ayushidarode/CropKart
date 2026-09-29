"""
data.py - Agricultural Data Collection & Storage FastAPI Router

WHY THIS FILE EXISTS:
Allows users, schedulers, or administrators to interact with CEDA Agmarknet data
and trigger agricultural data collection and Supabase storage via REST API endpoints.

WHAT THIS FILE DOES:
- GET  /api/data/commodities: Retrieve full catalog of agricultural commodities from CEDA.
- GET  /api/data/geographies: Retrieve states and districts geography hierarchy from CEDA.
- POST /api/data/markets: Retrieve mandis / markets for a commodity and geography from CEDA.
- POST /api/data/prices: Retrieve real mandi price records from CEDA.
- POST /api/data/quantities: Retrieve arrival quantity records from CEDA.
- POST /api/data/collect: Triggers FETCH -> VALIDATE -> CLEAN -> NORMALIZE -> SUPABASE STORE.
- GET  /api/data/health: Checks if backend, data source, and Supabase are healthy.
- GET  /api/data/status: Returns source name, database target, records count, and latest date.
- GET  /api/data/records: Lists recent stored market records from Supabase.
- GET  /api/data/market-summary: Returns count of records, grains, and mandis stored.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.models import AgriculturalMarketData, DataSource, Grain
    from app.data.fetcher import (
        CedaAuthError,
        CedaRateLimitError,
        CedaNetworkError,
        CedaApiError,
    )
    from app.schemas import (
        CedaCommoditiesResponse,
        CedaCommodityItem,
        CedaGeographiesResponse,
        CedaGeographyItem,
        CedaMarketItem,
        CedaMarketsRequest,
        CedaMarketsResponse,
        CedaPriceItem,
        CedaPricesRequest,
        CedaPricesResponse,
        CedaQuantitiesRequest,
        CedaQuantitiesResponse,
        CedaQuantityItem,
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
    from data.fetcher import (
        CedaAuthError,
        CedaRateLimitError,
        CedaNetworkError,
        CedaApiError,
    )
    from schemas import (
        CedaCommoditiesResponse,
        CedaCommodityItem,
        CedaGeographiesResponse,
        CedaGeographyItem,
        CedaMarketItem,
        CedaMarketsRequest,
        CedaMarketsResponse,
        CedaPriceItem,
        CedaPricesRequest,
        CedaPricesResponse,
        CedaQuantitiesRequest,
        CedaQuantitiesResponse,
        CedaQuantityItem,
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


# =====================================================================
# CEDA Agmarknet Direct Query Endpoints
# =====================================================================

@router.get(
    "/commodities",
    response_model=CedaCommoditiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all available commodities from CEDA Agmarknet",
    description="Returns the full catalog of commodities tracked in Agmarknet dataset."
)
async def get_commodities(
    force_refresh: bool = Query(False, description="Bypass cache and refresh from CEDA"),
    service: DataIngestionService = Depends(get_service),
) -> CedaCommoditiesResponse:
    """Retrieves all agricultural commodities supported by CEDA Agmarknet."""
    try:
        raw_list = await service.get_ceda_commodities(force_refresh=force_refresh)
        items = [
            CedaCommodityItem(
                commodity_id=int(c["commodity_id"]),
                commodity_name=c["commodity_name"],
            )
            for c in raw_list
            if "commodity_id" in c and "commodity_name" in c
        ]
        return CedaCommoditiesResponse(success=True, count=len(items), commodities=items)
    except CedaRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc)
        )
    except CedaAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Failed to fetch CEDA commodities: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CEDA commodities retrieval failed: {str(exc)}"
        )


@router.get(
    "/geographies",
    response_model=CedaGeographiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get all states and districts from CEDA Agmarknet",
    description="Returns census state and district hierarchy for market mapping."
)
async def get_geographies(
    force_refresh: bool = Query(False, description="Bypass cache and refresh from CEDA"),
    service: DataIngestionService = Depends(get_service),
) -> CedaGeographiesResponse:
    """Retrieves all states and districts from CEDA Agmarknet."""
    try:
        raw_list = await service.get_ceda_geographies(force_refresh=force_refresh)
        items = [
            CedaGeographyItem(
                census_state_id=int(g["census_state_id"]),
                census_state_name=g["census_state_name"],
                census_district_id=int(g["census_district_id"]),
                census_district_name=g["census_district_name"],
            )
            for g in raw_list
            if "census_state_id" in g and "census_district_id" in g
        ]
        return CedaGeographiesResponse(success=True, count=len(items), geographies=items)
    except CedaRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc)
        )
    except CedaAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Failed to fetch CEDA geographies: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CEDA geographies retrieval failed: {str(exc)}"
        )


@router.post(
    "/markets",
    response_model=CedaMarketsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get markets/mandis for a commodity and geography",
    description="Returns available mandis for specified commodity, state, and district."
)
async def get_markets(
    request: CedaMarketsRequest,
    service: DataIngestionService = Depends(get_service),
) -> CedaMarketsResponse:
    """Retrieves markets for a given commodity, state, and optional district."""
    try:
        raw_list = await service.get_ceda_markets(
            commodity_id=request.commodity_id,
            state_id=request.state_id,
            district_id=request.district_id,
            indicator=request.indicator or "price",
        )
        items = [
            CedaMarketItem(
                market_id=int(m["market_id"]),
                market_name=m["market_name"],
                census_state_id=m.get("census_state_id"),
                census_district_id=m.get("census_district_id"),
            )
            for m in raw_list
            if "market_id" in m and "market_name" in m
        ]
        return CedaMarketsResponse(success=True, count=len(items), markets=items)
    except CedaRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc)
        )
    except CedaAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Failed to fetch CEDA markets: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CEDA markets retrieval failed: {str(exc)}"
        )


@router.post(
    "/prices",
    response_model=CedaPricesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get real prices from CEDA Agmarknet",
    description="Retrieves wholesale mandi prices (min, max, modal) for specified date range."
)
async def get_prices(
    request: CedaPricesRequest,
    service: DataIngestionService = Depends(get_service),
) -> CedaPricesResponse:
    """Retrieves real price records directly from CEDA Agmarknet."""
    try:
        raw_list = await service.get_ceda_prices(
            commodity_id=request.commodity_id,
            state_id=request.state_id,
            from_date=request.from_date,
            to_date=request.to_date,
            district_id=request.district_id,
            market_id=request.market_id,
        )
        items = [
            CedaPriceItem(
                date=str(p.get("date", "")),
                commodity_id=int(p.get("commodity_id", request.commodity_id)),
                census_state_id=int(p.get("census_state_id", request.state_id)),
                census_district_id=p.get("census_district_id"),
                market_id=p.get("market_id"),
                min_price=float(p["min_price"]) if p.get("min_price") is not None else None,
                max_price=float(p["max_price"]) if p.get("max_price") is not None else None,
                modal_price=float(p["modal_price"]) if p.get("modal_price") is not None else None,
            )
            for p in raw_list
            if "date" in p
        ]
        return CedaPricesResponse(success=True, count=len(items), prices=items)
    except CedaRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc)
        )
    except CedaAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Failed to fetch CEDA prices: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CEDA prices retrieval failed: {str(exc)}"
        )


@router.post(
    "/quantities",
    response_model=CedaQuantitiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Get real arrival quantities from CEDA Agmarknet",
    description="Retrieves arrival quantity/volume records for specified date range."
)
async def get_quantities(
    request: CedaQuantitiesRequest,
    service: DataIngestionService = Depends(get_service),
) -> CedaQuantitiesResponse:
    """Retrieves real quantity records directly from CEDA Agmarknet."""
    try:
        raw_list = await service.get_ceda_quantities(
            commodity_id=request.commodity_id,
            state_id=request.state_id,
            from_date=request.from_date,
            to_date=request.to_date,
            district_id=request.district_id,
            market_id=request.market_id,
        )
        items = [
            CedaQuantityItem(
                date=str(q.get("date", "")),
                commodity_id=int(q.get("commodity_id", request.commodity_id)),
                census_state_id=int(q.get("census_state_id", request.state_id)),
                census_district_id=q.get("census_district_id"),
                market_id=q.get("market_id"),
                quantity=float(q["quantity"]) if q.get("quantity") is not None else None,
            )
            for q in raw_list
            if "date" in q
        ]
        return CedaQuantitiesResponse(success=True, count=len(items), quantities=items)
    except CedaRateLimitError as exc:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc)
        )
    except CedaAuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Failed to fetch CEDA quantities: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CEDA quantities retrieval failed: {str(exc)}"
        )


# =====================================================================
# End-to-End Ingestion, Storage, and Health Endpoints
# =====================================================================

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
    """Returns pipeline status matching platform requirements."""
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
    source_name = source_row.name if source_row else "ceda_agmarknet_api"

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
    description="Fetches real prices from CEDA Agmarknet, validates, cleans, and stores into Supabase."
)
async def collect_data(
    request: Optional[DataCollectRequest] = None,
    service: DataIngestionService = Depends(get_service),
    db: Session = Depends(get_db),
) -> DataCollectResponse:
    """
    Executes real data collection pipeline.
    Does NOT fabricate data. Returns summary of fetched, valid, stored, and skipped records.
    """
    req = request or DataCollectRequest()
    try:
        result = await service.ingest_market_data(
            source_url=req.source_url,
            commodity=req.commodity or "Wheat",
            limit=req.limit or 100,
            source=req.source or "ceda",
            state=req.state,
            district=req.district,
            market=req.market,
            from_date=req.from_date,
            to_date=req.to_date,
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
