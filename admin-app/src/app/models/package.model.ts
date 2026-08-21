export interface InternetPackage {
  id: number;
  name: string;
  price: number | string;
  duration_minutes: number;
  speed: string;
  is_active: boolean;
  available_from: string | null;
  available_until: string | null;
}

export interface PackagePayload {
  name: string;
  price: number;
  duration_minutes: number;
  speed: string;
  is_active?: boolean;
}

export interface PackageListResponse {
  success: boolean;
  packages: InternetPackage[];
}

export interface PackageResponse {
  success: boolean;
  message?: string;
  package: InternetPackage;
}
