interface ICLINIC_INPUT {
  clinics: any[];
  key: string;
  value: any;
}

type IPAGINATE_RESULT = {
  data: any[],
  total: number
}
/**
 * 
 * @param  {ICLINIC_INPUT} param0 
 * @returns { any[]}
 */
export const getFilteredClinics = ({ clinics, key, value }: ICLINIC_INPUT): any[] =>
  clinics.filter((item: any) => item[key] === value);

/**
 * 
 * @param {Array[]}clinics 
 * @returns { any[]}
 */
export const getMapedClinics = (...clinics: any[]): any[] =>
  clinics
    .reduce((clinic, acc) => [...clinic, ...acc], [])
    .map((item: any) => ({
      ...item,
      clinicName: item.clinicName || item.name,
      availability: item.availability || item.opening,
    }));

/**
 * 
 * @param {Array[]} data 
 * @param {number} pageNumber 
 * @param {number} limit 
 * @returns {IPAGINATE_RESULT}
 */
export const paginate = (data: any[], pageNumber: number, limit: number): IPAGINATE_RESULT => {
  const startIndex = (pageNumber - 1) * limit;
  const endIndex = pageNumber * limit;

  const paginatedData = data.slice(startIndex, endIndex);

  return { data: paginatedData, total: data.length };
};
