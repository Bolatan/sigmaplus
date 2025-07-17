export interface Chart {
  id: string;
  type: 'bar' | 'pie' | 'line';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
    }[];
  };
}

export interface Report {
  id: string;
  title: string;
  charts: Chart[];
}
