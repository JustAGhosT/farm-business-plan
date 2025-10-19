
import { WizardSession } from '@/lib/hooks/useWizardSessions'

interface LoadPlanModalProps {
  sessions: WizardSession[]
  onClose: () => void
  onLoad: (session: WizardSession) => void
}

export default function LoadPlanModal({ sessions, onClose, onLoad }: LoadPlanModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Load Saved Plan</h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No saved plans found.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {session.session_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.crops.length} crops, {session.years} years
                    </p>
                  </div>
                  <button
                    onClick={() => onLoad(session)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
