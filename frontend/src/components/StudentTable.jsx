const COURSE_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];
const courseColor = (course) => COURSE_COLORS[course.charCodeAt(0) % COURSE_COLORS.length];

const GRADIENTS = [
  'from-indigo-400 to-purple-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
];
const avatarGradient = (name) => GRADIENTS[name.charCodeAt(0) % GRADIENTS.length];

const StudentTable = ({ students, onEdit, onDelete }) => {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-500">No students found</p>
        <p className="text-sm mt-1">Add a student or try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['#', 'Student', 'Age', 'Email', 'Course', 'Joined', 'Actions'].map((h) => (
              <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {students.map((student, idx) => (
            <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors group">
              <td className="px-5 py-4 text-gray-300 font-medium">{idx + 1}</td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(student.name)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                    {student.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800">{student.name}</span>
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                  {student.age}
                </span>
              </td>

              <td className="px-5 py-4 text-gray-500">{student.email}</td>

              <td className="px-5 py-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${courseColor(student.course)}`}>
                  {student.course}
                </span>
              </td>

              <td className="px-5 py-4 text-gray-400 text-xs">
                {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {/* Edit */}
                  <button
                    onClick={() => onEdit(student)}
                    title="Edit student"
                    className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => onDelete(student)}
                    title="Delete student"
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
