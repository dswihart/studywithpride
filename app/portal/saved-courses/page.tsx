"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthContext"

interface SavedCourse {
  id: string
  content_id: string
  content_data: any
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export default function SavedCoursesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [savedCourses, setSavedCourses] = useState<SavedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) fetchSavedCourses()
  }, [user])

  const fetchSavedCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/portal/save-course")
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const result = await response.json()
      if (result.success) setSavedCourses(result.data || [])
      else setError(result.error)
    } catch (err: any) {
      setError("Failed to load saved courses")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Remove this course?")) return
    try {
      setDeletingId(courseId)
      const response = await fetch(`/api/portal/delete-course?course_id=${courseId}`, { method: "DELETE" })
      if (response.status === 401) {
        router.push("/login")
        return
      }
      const result = await response.json()
      if (result.success) setSavedCourses(prev => prev.filter(c => c.content_id !== courseId))
      else setError(result.error)
    } catch (err) {
      setError("Failed to delete course")
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your saved courses...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personalized course selection ({savedCourses.length} courses)
          </p>
        </div>
        <button
          onClick={() => router.push("/student-portal")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Portal
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {savedCourses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <h3 className="text-lg font-medium mb-2">No saved courses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start exploring courses and save your favorites
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">
                {course.content_data?.title || course.content_id}
              </h3>

              {course.content_data?.university && (
                <p className="text-sm text-gray-600 mb-2">{course.content_data.university}</p>
              )}

              {course.content_data?.description && (
                <p className="text-sm text-gray-700 mb-4">{course.content_data.description}</p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => router.push(`/courses/${course.content_id}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.content_id)}
                  disabled={deletingId === course.content_id}
                  className="px-4 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 disabled:opacity-50"
                >
                  {deletingId === course.content_id ? "..." : "Remove"}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Saved {new Date(course.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
