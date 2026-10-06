-- Run this in Supabase SQL Editor before deploying the updated Edge Function.

alter table public.travel_enquiries add column if not exists enquiry_type text;
update public.travel_enquiries set enquiry_type = case when lower(coalesce(trip_type,'')) = 'holiday' then 'holiday' else 'flight' end where enquiry_type is null;
alter table public.travel_enquiries alter column enquiry_type set default 'flight';
alter table public.travel_enquiries alter column enquiry_type set not null;
alter table public.travel_enquiries drop constraint if exists travel_enquiries_enquiry_type_check;
alter table public.travel_enquiries add constraint travel_enquiries_enquiry_type_check check (enquiry_type in ('flight','flight_hotel','hotel','holiday'));
alter table public.travel_enquiries drop constraint if exists travel_enquiries_trip_type_check;
alter table public.travel_enquiries add constraint travel_enquiries_trip_type_check check (trip_type in ('Round trip','One way','holiday','hotel'));
alter table public.travel_enquiries add column if not exists hotel_rooms integer not null default 1;
alter table public.travel_enquiries add column if not exists tentative_dates text;
alter table public.travel_enquiries add column if not exists package_id bigint;
alter table public.travel_enquiries add column if not exists package_name text;
alter table public.travel_enquiries drop constraint if exists travel_enquiries_hotel_rooms_check;
alter table public.travel_enquiries add constraint travel_enquiries_hotel_rooms_check check (hotel_rooms >= 1);
create index if not exists travel_enquiries_enquiry_type_idx on public.travel_enquiries(enquiry_type);
create index if not exists travel_enquiries_created_at_idx on public.travel_enquiries(created_at desc);


-- Optional package gallery support. Store public repo/CDN image URLs in this array.
alter table public.holiday_packages add column if not exists gallery_images text[] not null default '{}';
