/**
 * Convertit une chaîne de date au format JJ-MM-AAAA en Date
 */
export function parseDateString(dateString: string): Date {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  /**
   * Vérifie si la date est valide
   */
  export function isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  /**
   * Convertit une date au format SQL Server (AAAA-MM-JJ)
   */
  export function convertToSqlDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Retourne la date actuelle au format SQL Server
   */
  export function getCurrentSqlDate(): string {
    return convertToSqlDate(new Date());
  }

