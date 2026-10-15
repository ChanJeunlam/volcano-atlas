-- 火山目录快照：先写新快照并核对总量，再原子切换唯一活动指针。
-- data 为公开 DTO，便于离线文件与 API 使用同一个字段契约；不存私密信息。
create table public.dataset_snapshots (
 id uuid primary key,
 metadata jsonb not null,
 row_count integer not null check (row_count between 1 and 10000),
 created_at timestamptz not null default now()
);
create table public.volcanoes (
 snapshot_id uuid not null references public.dataset_snapshots(id),
 id text not null check (id ~ '^[0-9]{6}$'),
 data jsonb not null,
 primary key (snapshot_id,id),
 check (data->>'id'=id),
 check (jsonb_typeof(data->'latitude')='number' and (data->>'latitude')::double precision between -90 and 90),
 check (jsonb_typeof(data->'longitude')='number' and (data->>'longitude')::double precision between -180 and 180)
);
create table public.active_dataset (
 singleton boolean primary key default true check (singleton),
 snapshot_id uuid not null references public.dataset_snapshots(id)
);
-- 不创建匿名读取/写入策略；仅服务端凭证访问。RLS 不会限制 service_role，API 仍须投影。
alter table public.dataset_snapshots enable row level security;
alter table public.volcanoes enable row level security;
alter table public.active_dataset enable row level security;
revoke all on public.dataset_snapshots,public.volcanoes,public.active_dataset from anon,authenticated;
grant select,insert,update,delete on public.dataset_snapshots,public.volcanoes,public.active_dataset to service_role;
