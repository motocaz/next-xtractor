'use client';

import { useOrganizePages } from '../hooks/useOrganizePages';
import { PageOrganizerTool } from '@/components/common/PageOrganizerTool';

export const OrganizePagesTool = () => {
  const hookReturn = useOrganizePages();

  return (
    <PageOrganizerTool
      title="Organize Pages"
      description="Reorder, duplicate, or delete pages with a simple drag-and-drop interface. Drag pages to reorder them, or use the buttons to duplicate or delete pages."
      instructions="Drag pages to reorder • Hover to see actions"
      buttonText="Process & Download"
      hookReturn={hookReturn}
    />
  );
};
