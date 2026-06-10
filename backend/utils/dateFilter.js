const getDateRange = (range) => {
  const now = new Date();

  switch (range) {
    case "daily": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return { start, end: new Date() };
    }
    case "weekly": {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      return { start, end: new Date() };
    }
    case "monthly": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: new Date() };
    }
    case "quarterly": {
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      return { start, end: new Date() };
    }
    case "yearly": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: new Date() };
    }
    case "last30days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { start, end: new Date() };
    }
    case "last90days": {
      const start = new Date(now);
      start.setDate(now.getDate() - 90);
      return { start, end: new Date() };
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: new Date() };
    }
  }
};

export default getDateRange;
