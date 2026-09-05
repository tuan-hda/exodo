-- Convert savings goal icons from the original icon-name values to emojis.
update public.savings_goals
set icon = case icon
  when 'airplane' then '✈️'
  when 'house' then '🏠'
  when 'car' then '🚗'
  when 'graduation-cap' then '🎓'
  when 'heart' then '❤️'
  when 'briefcase' then '💼'
  when 'gift' then '🎁'
  when 'shield' then '🛡️'
  when 'wallet' then '👛'
  when 'star' then '⭐'
  else icon
end
where icon in ('airplane', 'house', 'car', 'graduation-cap', 'heart', 'briefcase', 'gift', 'shield', 'wallet', 'star');

alter table public.savings_goals
  alter column icon set default '✈️';
