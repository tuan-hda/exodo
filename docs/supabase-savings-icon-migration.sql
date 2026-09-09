-- Normalize savings goal icons to the vector icon names supported by Exodo.
-- Older installations may contain the original icon names or emoji values.
update public.savings_goals
set icon = case icon
  when 'airplane' then 'airplane'
  when 'house' then 'house'
  when 'car' then 'car'
  when 'briefcase' then 'briefcase'
  when 'gift' then 'gift'
  when 'wallet' then 'wallet'
  else 'target'
end;

alter table public.savings_goals
  alter column icon set default 'target';
