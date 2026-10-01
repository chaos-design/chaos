-- 当前脚手架只使用 Supabase Auth 的 Email Provider，不创建业务表、
-- Storage Bucket 或业务 RLS 策略。
--
-- 本文件是项目唯一的 SQL 汇总入口。注册邮箱域名限制使用
-- Before User Created Hook；Email Provider、Confirm email、OTP、Hook、
-- 回调地址和邮件模板配置见 supabase/README.md。
--
-- 在 Supabase SQL Editor 中完整执行本文件后，再将
-- public.restrict_registration_email_domain 绑定为 Before User Created Hook。

create or replace function public.restrict_registration_email_domain(event jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when lower(split_part(coalesce(event->'user'->>'email', ''), '@', 2)) = any (
      array[
        '126.com',
        '139.com',
        '163.com',
        '189.cn',
        'aliyun.com',
        'foxmail.com',
        'gmail.com',
        'hotmail.com',
        'icloud.com',
        'live.com',
        'me.com',
        'outlook.com',
        'proton.me',
        'protonmail.com',
        'qq.com',
        'sina.cn',
        'sina.com',
        'sohu.com',
        'wo.cn',
        'yahoo.com',
        'yeah.net'
      ]::text[]
    )
      then '{}'::jsonb
    else jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code',
        422,
        'message',
        'Unsupported registration email domain'
      )
    )
  end;
$$;

comment on function public.restrict_registration_email_domain(jsonb) is
  'Supabase Auth 创建用户前，仅允许常用邮箱服务商域名注册。';

grant usage on schema public to supabase_auth_admin;
revoke execute
  on function public.restrict_registration_email_domain(jsonb)
  from public, anon, authenticated;
grant execute
  on function public.restrict_registration_email_domain(jsonb)
  to supabase_auth_admin;
--
-- 新增业务表时，在提交可执行 SQL 前补齐：
--   1. 表名、用途以及对应的表单/页面。
--   2. 字段名、类型、默认值、可空性和校验约束。
--   3. 与 auth.users 的归属关系，通常使用 user_id uuid。
--   4. 主键、外键、唯一约束和查询所需索引。
--   5. Row Level Security 策略，使用 auth.uid() 限制数据所有者。
--   6. 表单字段到数据库字段的映射，以及服务端写入入口。
--   7. 是否需要 Storage、Realtime、数据库函数或 service role。
--
-- 不要直接修改 Supabase 管理的 auth schema。新增数据库对象继续汇总到本文件。
