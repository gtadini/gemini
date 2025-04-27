'use client';
import { ref, onValue, off, push, set } from 'firebase/database';
import { Suspense, useState } from 'react';
import { db } from '../firebase';

export default function Home() {
	const [title, setTitle] = useState("");
	const [subtitle, setSubtitle] = useState("");

	const handleAddData = () => {
		try {
			const usersRef = ref(db, 'users');
			const newDataRef = push(usersRef);

			set(newDataRef, {
				title: title,
				subtitle: subtitle,
			});
			setTitle("");
			setSubtitle("");
			alert('Data added successfully¡¡');
			} catch (error) {
			console.error('Firebase Error: ', error)
			}
		}
	return (
		<main className="flex min-h-screen flex-col items-center p-12">
		<h1 className='text-4x1 font-bold text-center my-10'>Add Data To Firebase Real</h1>
		<div className='mb-4'>
		<input
			type='text'
			placeholder='Title'
			value={title}
			onChange={(e) => setTitle(e.target.value)}
			className='w-full border p-2'
			/>
			<input
        type='text'
        placeholder='Sub Title'
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        className='w-full border p-2'
        />
		</div>
		<button onClick={handleAddData}
			className='bg-blue-500 text-white p-2 rounded'
		>
		Add Data
		</button>
		</main>);
}
