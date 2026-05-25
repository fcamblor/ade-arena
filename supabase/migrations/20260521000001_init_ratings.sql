create table if not exists public.ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_id text not null,
  rating smallint not null check (rating between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, feature_id)
);

create index if not exists ratings_feature_idx on public.ratings(feature_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ratings_set_updated_at on public.ratings;
create trigger ratings_set_updated_at
before update on public.ratings
for each row
execute function public.set_updated_at();
