export function getUserInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return '??';
  }

  const nameParts = name.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }

  const firstInitial = nameParts[0][0];
  const lastInitial = nameParts[nameParts.length - 1][0];
  
  return (firstInitial + lastInitial).toUpperCase();
}
