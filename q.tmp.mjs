import { createClient } from '@supabase/supabase-js'
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data, error } = await c.from('notification_captures').select('payload,type,received_at').order('received_at',{ascending:false}).limit(60)
if (error) throw error
for (const r of data) console.log(JSON.stringify({t:r.type,app:r.payload.source_app,title:r.payload.title,sub:r.payload.subtitle,msg:r.payload.message}))
