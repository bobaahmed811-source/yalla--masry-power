import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder => 
  PlaceHolderImages.find(img => img.id === id) || PlaceHolderImages[0];

export const user = {
  name: 'John Doe',
  avatar: getImage('user-avatar-1'),
};

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: ImagePlaceholder;
  progress: number;
  lessons: Lesson[];
  material: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

export interface DiscussionPost {
  id: string;
  author: {
    name: string;
    avatar: ImagePlaceholder;
  };
  timestamp: string;
  text: string;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    instructor: 'Dr. Angela Yu',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    thumbnail: getImage('course-thumb-1'),
    progress: 65,
    lessons: [
      { id: '1-1', title: 'Welcome to the Course', duration: '5:30', completed: true },
      { id: '1-2', title: 'HTML Basics', duration: '25:10', completed: true },
      { id: '1-3', title: 'CSS Styling', duration: '45:50', completed: true },
      { id: '1-4', title: 'JavaScript Fundamentals', duration: '1:10:20', completed: false },
      { id: '1-5', title: 'Final Project', duration: '2:30:00', completed: false },
    ],
    material: 'This section covers the core principles of web development. We will explore the structure of a web page with HTML, styling with CSS, and interactivity with JavaScript. Key concepts include the DOM (Document Object Model), responsive design for different screen sizes, and fundamental programming concepts in JavaScript like variables, functions, and loops. The goal is to provide a solid foundation for building your first web applications.'
  },
  {
    id: '2',
    title: 'Advanced Theoretical Physics',
    instructor: 'Dr. Brian Greene',
    description: 'Explore the mysteries of the universe, from quantum mechanics to string theory.',
    thumbnail: getImage('course-thumb-2'),
    progress: 20,
    lessons: [
        { id: '2-1', title: 'Introduction to Quantum Mechanics', duration: '40:15', completed: true },
        { id: '2-2', title: 'General Relativity', duration: '55:30', completed: false },
        { id: '2-3', title: 'String Theory Explained', duration: '1:05:00', completed: false },
    ],
    material: 'This course delves into the complex world of modern physics. We begin with the probabilistic nature of reality described by quantum mechanics, then move to Einstein\'s theory of general relativity, which governs gravity and the large-scale structure of the cosmos. Finally, we will touch upon string theory, a candidate for a "theory of everything." This course is mathematically intensive and requires a strong background in calculus and linear algebra.'
  },
  {
    id: '3',
    title: 'Digital Painting for Beginners',
    instructor: 'Mr. Ross Bob',
    description: 'Unleash your creativity and learn to create stunning digital art from scratch.',
    thumbnail: getImage('course-thumb-3'),
    progress: 90,
    lessons: [
        { id: '3-1', title: 'Setting Up Your Workspace', duration: '15:00', completed: true },
        { id: '3-2', title: 'Understanding Color & Light', duration: '35:45', completed: true },
        { id: '3-3', title: 'Your First Masterpiece', duration: '1:20:00', completed: true },
    ],
    material: 'Welcome to the world of digital art! In this course, you will learn how to use digital tools to create beautiful paintings. We will cover the basics of setting up your software and tablet, the fundamentals of color theory and lighting to make your art pop, and guide you step-by-step through creating a complete digital painting. No prior experience is necessary, just a passion for creativity.'
  },
  {
    id: '4',
    title: 'A Journey Through World History',
    instructor: 'Prof. Ken Burns',
    description: 'Discover the pivotal events and figures that shaped our modern world.',
    thumbnail: getImage('course-thumb-4'),
    progress: 0,
    lessons: [
        { id: '4-1', title: 'The Ancient Civilizations', duration: '50:00', completed: false },
        { id: '4-2', title: 'The Age of Empires', duration: '48:30', completed: false },
        { id: '4-3', title: 'The Modern Era', duration: '52:10', completed: false },
    ],
    material: 'History is the story of us. This course provides a sweeping overview of human history, from the earliest civilizations in Mesopotamia and Egypt to the interconnected global society of the 21st century. We will examine the rise and fall of great empires, the development of major religions and philosophies, and the key technological and social revolutions that have shaped human destiny. Our focus will be on understanding the connections between past and present.'
  },
];

export const discussions: DiscussionPost[] = [
  {
    id: '1',
    author: {
      name: 'Jane Smith',
      avatar: getImage('user-avatar-2'),
    },
    timestamp: '2 hours ago',
    text: 'I\'m having trouble with the CSS Flexbox alignment in lesson 3. Can anyone help explain the difference between `justify-content` and `align-items` again?',
  },
  {
    id: '2',
    author: {
      name: 'Alex Ray',
      avatar: getImage('user-avatar-3'),
    },
    timestamp: '1 day ago',
    text: 'The final project looks challenging but exciting! Does anyone want to form a study group to brainstorm ideas?',
  },
];
