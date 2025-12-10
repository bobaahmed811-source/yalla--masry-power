
'use client';

import {
  Firestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

/**
 * Creates the initial progress document for a new user.
 * It finds the first course and its first lesson to set the starting point.
 * @param firestore The Firestore instance.
 * @param userId The ID of the user.
 */
export async function createInitialProgress(firestore: Firestore, userId: string): Promise<void> {
  // Find the first course available (ordered by title for predictability).
  const coursesQuery = query(collection(firestore, 'courses'), orderBy('title'), limit(1));
  const coursesSnapshot = await getDocs(coursesQuery);

  if (coursesSnapshot.empty) {
    console.warn("No courses available to start progress. Progress document not created.");
    // In a real app, you might want to handle this more gracefully.
    // For now, we just won't create a progress doc if no courses exist.
    return;
  }

  const firstCourse = coursesSnapshot.docs[0];
  const courseId = firstCourse.id;

  // Find the first lesson in that course.
  const lessonsQuery = query(collection(firestore, `courses/${courseId}/lessons`), orderBy('order'), limit(1));
  const lessonsSnapshot = await getDocs(lessonsQuery);

  if (lessonsSnapshot.empty) {
     console.warn(`Course ${courseId} has no lessons. Progress document not created.`);
     // If the first course has no lessons, we also can't start progress.
     return;
  }

  const firstLessonId = lessonsSnapshot.docs[0].id;
  const progressDocId = `${userId}_${courseId}`;

  // Create the progress document.
  const progressRef = doc(firestore, `users/${userId}/progress`, progressDocId);

  await setDoc(progressRef, {
    userId: userId,
    courseId: courseId,
    completedLessons: [],
    currentLessonId: firstLessonId,
    // quizScores, assignmentCompletion, etc. can be added here as needed.
  });
}

/**
 * Updates a user's progress after completing a lesson.
 * @param firestore The Firestore instance.
 * @param userId The user's ID.
 * @param courseId The course ID.
 * @param completedLessonId The ID of the lesson just completed.
 */
export async function updateProgress(firestore: Firestore, userId: string, courseId: string, completedLessonId: string): Promise<void> {
  const progressDocId = `${userId}_${courseId}`;
  const progressRef = doc(firestore, `users/${userId}/progress`, progressDocId);

  // Find the next lesson in the course order.
  const lessonsQuery = query(collection(firestore, `courses/${courseId}/lessons`), orderBy('order'));
  const lessonsSnapshot = await getDocs(lessonsQuery);
  const allLessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, order: doc.data().order }));

  const completedLessonIndex = allLessons.findIndex(l => l.id === completedLessonId);

  if (completedLessonIndex === -1) {
    throw new Error(`Lesson ${completedLessonId} not found in course ${courseId}.`);
  }

  const nextLesson = allLessons[completedLessonIndex + 1];
  
  // Update the progress document.
  await updateDoc(progressRef, {
    completedLessons: arrayUnion(completedLessonId),
    currentLessonId: nextLesson ? nextLesson.id : '', // Empty string indicates course completion.
  });
}

  