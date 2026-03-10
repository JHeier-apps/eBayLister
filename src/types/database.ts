export type Publisher = {
  id: string;
  publishername: string;
};

export type Series = {
  id: string;
  seriesname: string;
  publisher_id: string;
  starting_year: number | null;
};

export type Listing = {
  id: string;
  user_id: string;
  series_id: string;
  issuenumber: string;
  listing: string | null;
  created_at: string;
  updated_at: string;
  listed_date: string | null;
};

export type SeriesWithPublisher = Series & {
  publisher?: Publisher | null;
};

export type ListingWithSeries = Listing & {
  series?: SeriesWithPublisher | null;
};
