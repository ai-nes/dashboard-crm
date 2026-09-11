import type {Metadata} from 'next'

import {RuleVersionsPage} from './_components/rule-versions-page'

export const metadata: Metadata = {
  title: 'Quản lý rule',
  description: 'Quản lý CRM Rule của FAIP CRM.',
}

export default function RulesConfigPage() {
  return <RuleVersionsPage />
}
