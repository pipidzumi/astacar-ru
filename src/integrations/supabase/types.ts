export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          diff: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          diff?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          diff?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          device: Json | null
          id: string
          ip: unknown | null
          listing_id: string
          placed_at: string
          source: Database["public"]["Enums"]["bid_source"]
          valid: boolean
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          device?: Json | null
          id?: string
          ip?: unknown | null
          listing_id: string
          placed_at?: string
          source?: Database["public"]["Enums"]["bid_source"]
          valid?: boolean
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          device?: Json | null
          id?: string
          ip?: unknown | null
          listing_id?: string
          placed_at?: string
          source?: Database["public"]["Enums"]["bid_source"]
          valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          listing_id: string
          provider_ref: string | null
          status: Database["public"]["Enums"]["deposit_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          listing_id: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          listing_id?: string
          provider_ref?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          evidence: Json | null
          id: string
          initiator_id: string
          listing_id: string
          reason_type: Database["public"]["Enums"]["dispute_reason"]
          resolution: Json | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          evidence?: Json | null
          id?: string
          initiator_id: string
          listing_id: string
          reason_type: Database["public"]["Enums"]["dispute_reason"]
          resolution?: Json | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence?: Json | null
          id?: string
          initiator_id?: string
          listing_id?: string
          reason_type?: Database["public"]["Enums"]["dispute_reason"]
          resolution?: Json | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          checklist: Json | null
          created_at: string
          expert_id: string
          expert_summary: string | null
          id: string
          inspected_at: string | null
          legal: Json | null
          listing_id: string
          media: Json | null
          updated_at: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          expert_id: string
          expert_summary?: string | null
          id?: string
          inspected_at?: string | null
          legal?: Json | null
          listing_id: string
          media?: Json | null
          updated_at?: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          expert_id?: string
          expert_summary?: string | null
          id?: string
          inspected_at?: string | null
          legal?: Json | null
          listing_id?: string
          media?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          buy_now_price: number | null
          created_at: string
          current_price: number
          end_at: string | null
          id: string
          reserve_price: number | null
          seller_id: string
          start_at: string | null
          start_price: number
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
          vehicle_id: string
          winner_id: string | null
        }
        Insert: {
          buy_now_price?: number | null
          created_at?: string
          current_price?: number
          end_at?: string | null
          id?: string
          reserve_price?: number | null
          seller_id: string
          start_at?: string | null
          start_price: number
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          vehicle_id: string
          winner_id?: string | null
        }
        Update: {
          buy_now_price?: number | null
          created_at?: string
          current_price?: number
          end_at?: string | null
          id?: string
          reserve_price?: number | null
          seller_id?: string
          start_at?: string | null
          start_price?: number
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          vehicle_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          order_index: number
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          order_index?: number
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          order_index?: number
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          attempts: number
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          payload: Json | null
          status: Database["public"]["Enums"]["notification_status"]
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["notification_status"]
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
        }
        Insert: {
          aggregate_id: string
          created_at?: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
        }
        Update: {
          aggregate_id?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          ban_flags: Json | null
          created_at: string
          dob: string | null
          full_name: string | null
          id_doc_masked: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          ban_flags?: Json | null
          created_at?: string
          dob?: string | null
          full_name?: string | null
          id_doc_masked?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          ban_flags?: Json | null
          created_at?: string
          dob?: string | null
          full_name?: string | null
          id_doc_masked?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_threads: {
        Row: {
          answer: string | null
          answerer_id: string | null
          created_at: string
          id: string
          listing_id: string
          question: string
          questioner_id: string | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answerer_id?: string | null
          created_at?: string
          id?: string
          listing_id: string
          question: string
          questioner_id?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answerer_id?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          question?: string
          questioner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_threads_answerer_id_fkey"
            columns: ["answerer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_threads_questioner_id_fkey"
            columns: ["questioner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_submissions: {
        Row: {
          accident_details: string | null
          accident_history: boolean | null
          approved_at: string | null
          body_style: string | null
          buy_now_price: number | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          drivetrain: string | null
          earliest_publish_date: string | null
          engine: string | null
          exterior_color: string | null
          flaws: string | null
          has_liens: boolean | null
          has_reserve: boolean | null
          has_restrictions: boolean | null
          highlights: string | null
          id: string
          import_status: boolean | null
          included_extras: string | null
          interior_color: string | null
          keys_count: number | null
          known_issues: string | null
          last_major_services: Json | null
          maintenance_history: string | null
          make: string | null
          manuals_available: boolean | null
          market_estimate: number | null
          media_quality_score: number | null
          mileage: number | null
          model: string | null
          moderation_completed_at: string | null
          moderation_feedback: Json | null
          moderator_id: string | null
          modifications: Json | null
          owners_count: number | null
          photos_count: number | null
          predecision_reason: string | null
          predecision_requirements: Json | null
          predecision_result: string | null
          preferred_publish_time: string | null
          public_description: string | null
          published_at: string | null
          region: string | null
          required_photos_checklist: Json | null
          reserve_price: number | null
          sale_reason: string | null
          seller_id: string
          seller_notes: string | null
          seller_type: string | null
          service_records: Json | null
          start_price: number | null
          status: string
          submitted_for_moderation_at: string | null
          title_type: string | null
          transmission: string | null
          trim: string | null
          updated_at: string
          usage_type: string | null
          videos_count: number | null
          vin: string | null
          vin_unknown_reason: string | null
          warning_lights: boolean | null
          winter_storage: boolean | null
          year: number | null
        }
        Insert: {
          accident_details?: string | null
          accident_history?: boolean | null
          approved_at?: string | null
          body_style?: string | null
          buy_now_price?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          drivetrain?: string | null
          earliest_publish_date?: string | null
          engine?: string | null
          exterior_color?: string | null
          flaws?: string | null
          has_liens?: boolean | null
          has_reserve?: boolean | null
          has_restrictions?: boolean | null
          highlights?: string | null
          id?: string
          import_status?: boolean | null
          included_extras?: string | null
          interior_color?: string | null
          keys_count?: number | null
          known_issues?: string | null
          last_major_services?: Json | null
          maintenance_history?: string | null
          make?: string | null
          manuals_available?: boolean | null
          market_estimate?: number | null
          media_quality_score?: number | null
          mileage?: number | null
          model?: string | null
          moderation_completed_at?: string | null
          moderation_feedback?: Json | null
          moderator_id?: string | null
          modifications?: Json | null
          owners_count?: number | null
          photos_count?: number | null
          predecision_reason?: string | null
          predecision_requirements?: Json | null
          predecision_result?: string | null
          preferred_publish_time?: string | null
          public_description?: string | null
          published_at?: string | null
          region?: string | null
          required_photos_checklist?: Json | null
          reserve_price?: number | null
          sale_reason?: string | null
          seller_id: string
          seller_notes?: string | null
          seller_type?: string | null
          service_records?: Json | null
          start_price?: number | null
          status?: string
          submitted_for_moderation_at?: string | null
          title_type?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          usage_type?: string | null
          videos_count?: number | null
          vin?: string | null
          vin_unknown_reason?: string | null
          warning_lights?: boolean | null
          winter_storage?: boolean | null
          year?: number | null
        }
        Update: {
          accident_details?: string | null
          accident_history?: boolean | null
          approved_at?: string | null
          body_style?: string | null
          buy_now_price?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          drivetrain?: string | null
          earliest_publish_date?: string | null
          engine?: string | null
          exterior_color?: string | null
          flaws?: string | null
          has_liens?: boolean | null
          has_reserve?: boolean | null
          has_restrictions?: boolean | null
          highlights?: string | null
          id?: string
          import_status?: boolean | null
          included_extras?: string | null
          interior_color?: string | null
          keys_count?: number | null
          known_issues?: string | null
          last_major_services?: Json | null
          maintenance_history?: string | null
          make?: string | null
          manuals_available?: boolean | null
          market_estimate?: number | null
          media_quality_score?: number | null
          mileage?: number | null
          model?: string | null
          moderation_completed_at?: string | null
          moderation_feedback?: Json | null
          moderator_id?: string | null
          modifications?: Json | null
          owners_count?: number | null
          photos_count?: number | null
          predecision_reason?: string | null
          predecision_requirements?: Json | null
          predecision_result?: string | null
          preferred_publish_time?: string | null
          public_description?: string | null
          published_at?: string | null
          region?: string | null
          required_photos_checklist?: Json | null
          reserve_price?: number | null
          sale_reason?: string | null
          seller_id?: string
          seller_notes?: string | null
          seller_type?: string | null
          service_records?: Json | null
          start_price?: number | null
          status?: string
          submitted_for_moderation_at?: string | null
          title_type?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          usage_type?: string | null
          videos_count?: number | null
          vin?: string | null
          vin_unknown_reason?: string | null
          warning_lights?: boolean | null
          winter_storage?: boolean | null
          year?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      submission_media: {
        Row: {
          category: string | null
          created_at: string
          file_size: number | null
          id: string
          order_index: number
          quality_score: number | null
          resolution: string | null
          submission_id: string
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          order_index?: number
          quality_score?: number | null
          resolution?: string | null
          submission_id: string
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          order_index?: number
          quality_score?: number | null
          resolution?: string | null
          submission_id?: string
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_media_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "seller_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          buyer_id: string
          created_at: string
          documents: Json | null
          escrow_ref: string | null
          fee_amount: number
          id: string
          listing_id: string
          seller_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
          vehicle_amount: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          documents?: Json | null
          escrow_ref?: string | null
          fee_amount: number
          id?: string
          listing_id: string
          seller_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          vehicle_amount: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          documents?: Json | null
          escrow_ref?: string | null
          fee_amount?: number
          id?: string
          listing_id?: string
          seller_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          vehicle_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string
          docs_status: Json | null
          drivetrain: string | null
          engine: string | null
          id: string
          make: string
          mileage: number
          model: string
          owners_count: number | null
          transmission: string | null
          updated_at: string
          vin: string
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          docs_status?: Json | null
          drivetrain?: string | null
          engine?: string | null
          id?: string
          make: string
          mileage: number
          model: string
          owners_count?: number | null
          transmission?: string | null
          updated_at?: string
          vin: string
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string
          docs_status?: Json | null
          drivetrain?: string | null
          engine?: string | null
          id?: string
          make?: string
          mileage?: number
          model?: string
          owners_count?: number | null
          transmission?: string | null
          updated_at?: string
          vin?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_moderator_or_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      place_bid_transaction: {
        Args: {
          p_amount: number
          p_bidder_id: string
          p_listing_id: string
          p_new_end_at: string
          p_user_ip?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      bid_source: "manual" | "autobid"
      deposit_status: "hold" | "released" | "captured" | "failed"
      dispute_reason:
        | "condition_mismatch"
        | "undisclosed_lien"
        | "doc_issue"
        | "other"
      dispute_status: "open" | "in_review" | "resolved" | "rejected"
      kyc_status: "pending" | "success" | "failed" | "not_required"
      listing_status: "draft" | "moderation" | "live" | "finished" | "cancelled"
      media_type: "photo" | "video" | "doc"
      notification_channel: "email" | "sms" | "push" | "webhook"
      notification_status: "pending" | "sent" | "failed"
      transaction_status:
        | "initiated"
        | "escrow"
        | "paid"
        | "released"
        | "refund"
        | "failed"
      user_role: "guest" | "buyer" | "seller" | "expert" | "moderator" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bid_source: ["manual", "autobid"],
      deposit_status: ["hold", "released", "captured", "failed"],
      dispute_reason: [
        "condition_mismatch",
        "undisclosed_lien",
        "doc_issue",
        "other",
      ],
      dispute_status: ["open", "in_review", "resolved", "rejected"],
      kyc_status: ["pending", "success", "failed", "not_required"],
      listing_status: ["draft", "moderation", "live", "finished", "cancelled"],
      media_type: ["photo", "video", "doc"],
      notification_channel: ["email", "sms", "push", "webhook"],
      notification_status: ["pending", "sent", "failed"],
      transaction_status: [
        "initiated",
        "escrow",
        "paid",
        "released",
        "refund",
        "failed",
      ],
      user_role: ["guest", "buyer", "seller", "expert", "moderator", "admin"],
    },
  },
} as const
