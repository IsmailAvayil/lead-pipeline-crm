import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { LeadFormModal } from './LeadFormModal';
import { DeleteLeadModal } from './DeleteLeadModal';

export const LeadManagementModals: React.FC = () => {
  const {
    leadModal,
    deleteModalLeadId,
    closeLeadModal,
    closeDeleteModal,
    openEditLead,
    openDeleteLead,
  } = useCRM();

  return (
    <>
      {leadModal && (
        <LeadFormModal
          mode={leadModal.mode}
          leadId={leadModal.leadId}
          onClose={closeLeadModal}
          onRequestDelete={id => {
            closeLeadModal();
            openDeleteLead(id);
          }}
          onSwitchToEdit={id => openEditLead(id)}
        />
      )}
      {deleteModalLeadId && (
        <DeleteLeadModal
          leadId={deleteModalLeadId}
          onClose={closeDeleteModal}
        />
      )}
    </>
  );
};
