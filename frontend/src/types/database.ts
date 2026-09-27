export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'admin';

export type CropCategory =
  | 'Grain'
  | 'Vegetable'
  | 'Fruit'
  | 'Pulse'
  | 'Oilseed'
  | 'Commercial'
  | 'Spices';

export type QualityGrade = 'Grade A' | 'Grade B' | 'Standard' | 'Premium';

export type CropStatus = 'available' | 'reserved' | 'sold' | 'draft';

export type SampleRequestStatus =
  | 'sample_requested'
  | 'sample_accepted'
  | 'sample_rejected'
  | 'sample_sent'
  | 'sample_received'
  | 'approved'
  | 'rejected';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'escrow' | 'paid' | 'failed' | 'refunded';

export type TransportStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type NotificationType =
  | 'sample_request'
  | 'sample_status'
  | 'order_new'
  | 'order_status'
  | 'transport_update'
  | 'ai_alert'
  | 'forecast_alert'
  | 'system';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          mobile: string | null;
          role: UserRole;
          location: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name: string;
          mobile?: string | null;
          role?: UserRole;
          location?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string;
          mobile?: string | null;
          role?: UserRole;
          location?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      farmer_profiles: {
        Row: {
          id: string;
          farm_name: string;
          years_active: number;
          total_acres: number;
          is_verified: boolean;
          rating: number;
          review_count: number;
          district: string | null;
          state: string | null;
          upi_id: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          farm_name: string;
          years_active?: number;
          total_acres?: number;
          is_verified?: boolean;
          rating?: number;
          review_count?: number;
          district?: string | null;
          state?: string | null;
          upi_id?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farm_name?: string;
          years_active?: number;
          total_acres?: number;
          is_verified?: boolean;
          rating?: number;
          review_count?: number;
          district?: string | null;
          state?: string | null;
          upi_id?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
      };
      buyer_profiles: {
        Row: {
          id: string;
          company_name: string;
          business_type: string;
          gst_number: string | null;
          is_verified: boolean;
          rating: number;
          district: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          business_type?: string;
          gst_number?: string | null;
          is_verified?: boolean;
          rating?: number;
          district?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          business_type?: string;
          gst_number?: string | null;
          is_verified?: boolean;
          rating?: number;
          district?: string | null;
          state?: string | null;
          updated_at?: string;
        };
      };
      transporter_profiles: {
        Row: {
          id: string;
          company_name: string;
          vehicle_type: string;
          vehicle_number: string | null;
          capacity_tonnes: number;
          is_verified: boolean;
          is_available: boolean;
          district: string | null;
          state: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          vehicle_type?: string;
          vehicle_number?: string | null;
          capacity_tonnes?: number;
          is_verified?: boolean;
          is_available?: boolean;
          district?: string | null;
          state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          vehicle_type?: string;
          vehicle_number?: string | null;
          capacity_tonnes?: number;
          is_verified?: boolean;
          is_available?: boolean;
          district?: string | null;
          state?: string | null;
          updated_at?: string;
        };
      };
      crops: {
        Row: {
          id: string;
          farmer_id: string;
          name: string;
          variety: string;
          category: CropCategory;
          quantity: number;
          unit: string;
          price_per_unit: number;
          quality_grade: QualityGrade;
          organic: boolean;
          harvest_date: string | null;
          available_from: string;
          location: string;
          district: string | null;
          state: string | null;
          description: string | null;
          moisture_percent: number | null;
          storage_type: string | null;
          fertilizers_used: string | null;
          status: CropStatus;
          primary_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farmer_id: string;
          name: string;
          variety: string;
          category?: CropCategory;
          quantity: number;
          unit?: string;
          price_per_unit: number;
          quality_grade?: QualityGrade;
          organic?: boolean;
          harvest_date?: string | null;
          available_from?: string;
          location: string;
          district?: string | null;
          state?: string | null;
          description?: string | null;
          moisture_percent?: number | null;
          storage_type?: string | null;
          fertilizers_used?: string | null;
          status?: CropStatus;
          primary_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farmer_id?: string;
          name?: string;
          variety?: string;
          category?: CropCategory;
          quantity?: number;
          unit?: string;
          price_per_unit?: number;
          quality_grade?: QualityGrade;
          organic?: boolean;
          harvest_date?: string | null;
          available_from?: string;
          location?: string;
          district?: string | null;
          state?: string | null;
          description?: string | null;
          moisture_percent?: number | null;
          storage_type?: string | null;
          fertilizers_used?: string | null;
          status?: CropStatus;
          primary_image_url?: string | null;
          updated_at?: string;
        };
      };
      sample_requests: {
        Row: {
          id: string;
          buyer_id: string;
          farmer_id: string;
          crop_id: string;
          quantity: number;
          unit: string;
          delivery_address: string;
          tracking_number: string | null;
          notes: string | null;
          status: SampleRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          farmer_id: string;
          crop_id: string;
          quantity?: number;
          unit?: string;
          delivery_address: string;
          tracking_number?: string | null;
          notes?: string | null;
          status?: SampleRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          farmer_id?: string;
          crop_id?: string;
          quantity?: number;
          unit?: string;
          delivery_address?: string;
          tracking_number?: string | null;
          notes?: string | null;
          status?: SampleRequestStatus;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          farmer_id: string;
          crop_id: string | null;
          quantity: number;
          unit: string;
          price_per_unit: number;
          total_price: number;
          pickup_location: string;
          delivery_location: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          payment_method: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          buyer_id: string;
          farmer_id: string;
          crop_id?: string | null;
          quantity: number;
          unit?: string;
          price_per_unit: number;
          total_price: number;
          pickup_location: string;
          delivery_location: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          buyer_id?: string;
          farmer_id?: string;
          crop_id?: string | null;
          quantity?: number;
          unit?: string;
          price_per_unit?: number;
          total_price?: number;
          pickup_location?: string;
          delivery_location?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          payment_method?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      transport_requests: {
        Row: {
          id: string;
          order_id: string;
          transporter_id: string | null;
          pickup_location: string;
          delivery_location: string;
          distance_km: number | null;
          estimated_hours: number | null;
          vehicle_type: string | null;
          vehicle_number: string | null;
          cost: number | null;
          status: TransportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          transporter_id?: string | null;
          pickup_location: string;
          delivery_location: string;
          distance_km?: number | null;
          estimated_hours?: number | null;
          vehicle_type?: string | null;
          vehicle_number?: string | null;
          cost?: number | null;
          status?: TransportStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          transporter_id?: string | null;
          pickup_location?: string;
          delivery_location?: string;
          distance_km?: number | null;
          estimated_hours?: number | null;
          vehicle_type?: string | null;
          vehicle_number?: string | null;
          cost?: number | null;
          status?: TransportStatus;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: NotificationType;
          link?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: NotificationType;
          link?: string | null;
          is_read?: boolean;
        };
      };
      buyer_requirements: {
        Row: {
          id: string;
          buyer_id: string;
          crop_name: string;
          variety: string | null;
          category: CropCategory;
          quantity: number;
          unit: string;
          target_price: number | null;
          location: string;
          district: string | null;
          state: string | null;
          urgency: string;
          status: 'active' | 'fulfilled' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          crop_name: string;
          variety?: string | null;
          category?: CropCategory;
          quantity: number;
          unit?: string;
          target_price?: number | null;
          location: string;
          district?: string | null;
          state?: string | null;
          urgency?: string;
          status?: 'active' | 'fulfilled' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          crop_name?: string;
          variety?: string | null;
          category?: CropCategory;
          quantity?: number;
          unit?: string;
          target_price?: number | null;
          location?: string;
          district?: string | null;
          state?: string | null;
          urgency?: string;
          status?: 'active' | 'fulfilled' | 'cancelled';
          updated_at?: string;
        };
      };
      market_data: {
        Row: {
          id: string;
          commodity: string;
          variety: string | null;
          mandi: string;
          district: string;
          state: string;
          record_date: string;
          arrival_quantity: number | null;
          minimum_price: number | null;
          maximum_price: number | null;
          modal_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          commodity: string;
          variety?: string | null;
          mandi: string;
          district: string;
          state: string;
          record_date: string;
          arrival_quantity?: number | null;
          minimum_price?: number | null;
          maximum_price?: number | null;
          modal_price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          commodity?: string;
          variety?: string | null;
          mandi?: string;
          district?: string;
          state?: string;
          record_date?: string;
          arrival_quantity?: number | null;
          minimum_price?: number | null;
          maximum_price?: number | null;
          modal_price?: number | null;
        };
      };
      forecast_results: {
        Row: {
          id: string;
          crop: string;
          variety: string | null;
          mandi: string;
          district: string;
          state: string;
          predicted_price_next_7d: number;
          predicted_demand_next_7d: string;
          confidence: number;
          trend_direction: 'up' | 'down' | 'stable';
          festival_tag: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          crop: string;
          variety?: string | null;
          mandi: string;
          district: string;
          state: string;
          predicted_price_next_7d: number;
          predicted_demand_next_7d: string;
          confidence?: number;
          trend_direction?: 'up' | 'down' | 'stable';
          festival_tag?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          crop?: string;
          variety?: string | null;
          mandi?: string;
          district?: string;
          state?: string;
          predicted_price_next_7d?: number;
          predicted_demand_next_7d?: string;
          confidence?: number;
          trend_direction?: 'up' | 'down' | 'stable';
          festival_tag?: string | null;
        };
      };
      route_estimates: {
        Row: {
          id: string;
          origin: string;
          destination: string;
          distance_km: number;
          duration_hours: number;
          recommended_vehicle: string | null;
          estimated_cost: number | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          origin: string;
          destination: string;
          distance_km: number;
          duration_hours: number;
          recommended_vehicle?: string | null;
          estimated_cost?: number | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          origin?: string;
          destination?: string;
          distance_km?: number;
          duration_hours?: number;
          recommended_vehicle?: string | null;
          estimated_cost?: number | null;
          status?: string;
        };
      };
    };
  };
}
