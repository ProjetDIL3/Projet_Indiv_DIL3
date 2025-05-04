
//Convertit une chaîne de date au format JJ-MM-AAAA en Date 
export function parseDateString(dateString: string): Date {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Vérifie si une date est valide
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Convertit une date au format SQL Server (AAAA-MM-JJ)
export function convertToSqlDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convertit une date avec heure au format SQL Server (AAAA-MM-JJ HH:MM:SS)
export function convertToSqlDateTime(date: Date): string {
  const datePart = convertToSqlDate(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${datePart} ${hours}:${minutes}:${seconds}`;
}


//Retourne la date actuelle au format SQL Server
export function getCurrentSqlDate(): string {
  return convertToSqlDate(new Date());
}

