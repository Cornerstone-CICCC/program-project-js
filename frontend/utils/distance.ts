// src/utils/distance.ts

/**
 * 하버사인 공식(Haversine Formula)을 이용해
 * 두 위도/경도 사이의 직선 거리(km)를 구합니다.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): string {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km 단위 결과

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`; // 1km 미만은 m로 표시
  }
  return `${distance.toFixed(1)}km`; // 1km 이상은 소수점 1자리까지 표시
}
