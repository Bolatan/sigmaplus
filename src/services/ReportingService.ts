import { Report } from '../types/report';

const reports: Report[] = [];

export const ReportingService = {
  getAll: async (): Promise<Report[]> => {
    return reports;
  },

  getById: async (id: string): Promise<Report | undefined> => {
    return reports.find((report) => report.id === id);
  },

  create: async (report: Report): Promise<Report> => {
    reports.push(report);
    return report;
  },

  update: async (id: string, updatedReport: Report): Promise<Report | undefined> => {
    const index = reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      reports[index] = updatedReport;
      return updatedReport;
    }
    return undefined;
  },

  delete: async (id: string): Promise<void> => {
    const index = reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      reports.splice(index, 1);
    }
  },
};
