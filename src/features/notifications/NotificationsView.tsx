'use client'

import { PageShell } from '@/components/PageShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Entry } from '@/features/entries/types'
import { CaptureInbox } from '@/features/notification-capture/CaptureInbox'
import { GmailInboxView } from './GmailInboxView'

export function NotificationsView(props: {
  onSaveEntries: (entries: Entry[]) => Promise<boolean>
  isSaving: boolean
  onCapturesImported: () => Promise<unknown>
}) {
  return (
    <PageShell size="wide">
      <Tabs defaultValue="v2">
        <TabsList aria-label="Inbox source">
          <TabsTrigger value="v2">v2</TabsTrigger>
          <TabsTrigger value="v1">v1</TabsTrigger>
        </TabsList>
        <TabsContent value="v1">
          <GmailInboxView {...props} />
        </TabsContent>
        <TabsContent value="v2">
          <CaptureInbox onImported={props.onCapturesImported} />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
