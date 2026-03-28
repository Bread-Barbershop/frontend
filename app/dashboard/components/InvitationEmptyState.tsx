type InvitationEmptyStateProps = {
  message: string;
};

function InvitationEmptyState({ message }: InvitationEmptyStateProps) {
  return (
    <div className="flex h-full items-end">
      <div className="flex h-118.75 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-center text-sm font-medium text-[#121212] backdrop-blur-xs">
        {message}
      </div>
    </div>
  );
}

export default InvitationEmptyState;
