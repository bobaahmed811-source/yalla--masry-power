
'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { ARTIFACT_DATA, type Artifacts } from '@/lib/artifacts';
import { useToast } from '@/hooks/use-toast';
import { getSpeechAudio } from '@/app/ai-actions'; // Updated import path


export default function MuseumPage() {
    const mountRef = useRef<HTMLDivElement>(null);
    const markersContainerRef = useRef<HTMLDivElement>(null);
    const infoPanelRef = useRef<HTMLDivElement>(null);
    const reportModalRef = useRef<HTMLDivElement>(null);
    const blockerRef = useRef<HTMLDivElement>(null);
    const joystickRef = useRef<HTMLDivElement>(null);
    const joystickHandleRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Use useState for artifact data to make it reactive
    const [artifacts, setArtifacts] = useState<Artifacts>(ARTIFACT_DATA);
    const [isSpeaking, setIsSpeaking] = useState(false);


    const state = useRef({
        camera: null as THREE.PerspectiveCamera | null,
        scene: null as THREE.Scene | null,
        renderer: null as THREE.WebGLRenderer | null,
        
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        isMoving: false,
        
        isBlocked: true,
        isReportVisible: false,

        isDragging: false,
        lon: 0,
        lat: 0,
        onMouseDownMouseX: 0,
        onMouseDownMouseY: 0,
        onMouseDownLon: 0,
        onMouseDownLat: 0,
        
        forwardVector: new THREE.Vector3(0, 0, -1),
        rightVector: new THREE.Vector3(1, 0, 0),
        euler: new THREE.Euler(0, 0, 0, 'YXZ'),
        
        lastTime: performance.now(),

        currentArtifactName: null as string | null,

        markersMap: {} as { [key: string]: HTMLDivElement },
        tempVector: new THREE.Vector3(),

        joystickActive: false,
        joystickStartX: 0,
        joystickStartY: 0,

    }).current;

    const alertMessage = useCallback((message: string, type: 'error' | 'success' | 'info') => {
        const messageContainer = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-700' : (type === 'success' ? 'bg-green-700' : 'bg-blue-700');
        messageContainer.className = `alert-message fixed bottom-4 right-4 text-white font-bold ${bgColor} p-3 rounded-lg shadow-xl z-[100] transition-opacity duration-300`;
        messageContainer.textContent = message;

        document.querySelectorAll('.alert-message').forEach(el => el.remove());
        document.body.appendChild(messageContainer);

        setTimeout(() => {
            messageContainer.style.opacity = '0';
            setTimeout(() => messageContainer.remove(), 300);
        }, 4000);
    }, []);

    const hideInfoPanel = useCallback(() => {
        if (infoPanelRef.current) {
            infoPanelRef.current.classList.remove('visible');
        }
        state.isBlocked = false;
        if (state.renderer) {
            state.renderer.domElement.focus();
        }
        state.isDragging = false;
    }, [state]);

    const showInfoPanel = useCallback((artifactName: string) => {
        const data = artifacts[artifactName];
        if (!data || !infoPanelRef.current) return;

        state.currentArtifactName = artifactName;

        const panel = infoPanelRef.current;
        (panel.querySelector('#artifact-title') as HTMLElement).textContent = data.title;
        (panel.querySelector('#artifact-description') as HTMLElement).textContent = data.description;
        (panel.querySelector('#puzzle-text') as HTMLElement).textContent = data.puzzle;
        panel.querySelector('#puzzle-content')?.classList.add('hidden');
        
        panel.classList.add('visible');
        state.isBlocked = true;
    }, [state, artifacts]);
    
    const updateMarkers = useCallback(() => {
        if (!state.camera || !state.scene) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const MAX_MARKER_DISTANCE = 1000;

        for (const name in artifacts) {
            const obj = state.scene.getObjectByName(`exhibit-${name}`);
            if (obj && obj.userData.markerPosition) {
                const marker = state.markersMap[name];
                if (!marker) continue;

                state.tempVector.copy(obj.userData.markerPosition);
                state.tempVector.project(state.camera);

                const markerX = (state.tempVector.x * 0.5 + 0.5) * width;
                const markerY = (state.tempVector.y * -0.5 + 0.5) * height;

                const distance = state.camera.position.distanceTo(obj.userData.markerPosition);

                if (state.tempVector.z < 1 && distance < MAX_MARKER_DISTANCE) {
                    marker.style.display = 'flex';
                    marker.style.left = `${markerX}px`;
                    marker.style.top = `${markerY}px`;

                    const scale = Math.max(0.9, Math.min(1.5, 300 / distance));
                    const opacity = Math.max(0.5, Math.min(1.0, 200 / distance));

                    marker.style.transform = `translate(-50%, -50%) scale(${scale})`;
                    marker.style.opacity = opacity.toString();
                } else {
                    marker.style.display = 'none';
                }
            }
        }
    }, [state, artifacts]);

    const animate = useCallback((currentTime: number) => {
        requestAnimationFrame(animate);
        if (!state.renderer || !state.scene || !state.camera) return;

        try {
            const delta = (currentTime - state.lastTime) / 1000;
            state.lastTime = currentTime;

            state.euler.y = THREE.MathUtils.degToRad(state.lon);
            state.euler.x = THREE.MathUtils.degToRad(state.lat);
            state.camera.quaternion.setFromEuler(state.euler);
            
            const speed = 150.0;
            if (!state.isBlocked && !state.isReportVisible && (state.isMoving || state.joystickActive)) {
                const forward = state.forwardVector.clone().applyQuaternion(state.camera.quaternion);
                forward.y = 0;
                forward.normalize();

                const right = state.rightVector.clone().applyQuaternion(state.camera.quaternion);
                right.y = 0;
                right.normalize();

                const moveSpeed = speed * delta;
                if (state.moveForward) state.camera.position.addScaledVector(forward, moveSpeed);
                if (state.moveBackward) state.camera.position.addScaledVector(forward, -moveSpeed);
                if (state.moveRight) state.camera.position.addScaledVector(right, moveSpeed);
                if (state.moveLeft) state.camera.position.addScaledVector(right, -moveSpeed);
            }

            updateMarkers();

            state.renderer.render(state.scene, state.camera);

        } catch (error) {
            console.error("Error during animation frame:", error);
        }
    }, [state, updateMarkers]);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const init = () => {
            try {
                state.scene = new THREE.Scene();
                state.scene.background = new THREE.Color(0x000000);
                state.scene.fog = new THREE.Fog(0x000000, 100, 300);

                state.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
                state.camera.position.set(0, 10, 0);
                state.lon = 0;
                state.lat = 0;

                state.renderer = new THREE.WebGLRenderer({ antialias: true });
                state.renderer.setPixelRatio(window.devicePixelRatio);
                state.renderer.setSize(window.innerWidth, window.innerHeight);
                state.renderer.domElement.tabIndex = 0;
                currentMount.appendChild(state.renderer.domElement);

                // Lighting
                const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
                state.scene.add(ambientLight);
                const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
                directionalLight.position.set(50, 100, 50);
                directionalLight.castShadow = true;
                directionalLight.shadow.mapSize.width = 1024;
                directionalLight.shadow.mapSize.height = 1024;
                state.scene.add(directionalLight);
                state.renderer.shadowMap.enabled = true;
                state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

                // Museum Geometry
                const wallSize = 500;
                const wallHeight = 50;
                const floor = new THREE.Mesh(new THREE.PlaneGeometry(wallSize, wallSize), new THREE.MeshStandardMaterial({ color: 0x2e2e2e, side: THREE.DoubleSide, metalness: 0.1, roughness: 0.8 }));
                floor.rotation.x = -Math.PI / 2;
                floor.receiveShadow = true;
                state.scene.add(floor);
                const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2a10, side: THREE.DoubleSide });
                [{ x: 0, z: -wallSize / 2, rotY: 0 }, { x: 0, z: wallSize / 2, rotY: Math.PI }, { x: wallSize / 2, z: 0, rotY: -Math.PI / 2 }, { x: -wallSize / 2, z: 0, rotY: Math.PI / 2 }].forEach(w => {
                    const wall = new THREE.Mesh(new THREE.PlaneGeometry(wallSize, wallHeight), wallMaterial);
                    wall.position.set(w.x, wallHeight / 2, w.z);
                    wall.rotation.y = w.rotY;
                    wall.receiveShadow = true;
                    state.scene!.add(wall);
                });
                const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(wallSize, wallSize), new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }));
                ceiling.position.y = wallHeight;
                ceiling.rotation.x = Math.PI / 2;
                state.scene.add(ceiling);

                // Exhibits
                for (const name in artifacts) {
                    const data = artifacts[name as keyof typeof artifacts];
                    
                    const base = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 30), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.5, roughness: 0.5 }));
                    base.position.copy(data.position);
                    base.position.y = 5;
                    base.receiveShadow = true;
                    base.castShadow = true;
                    base.name = `exhibit-${name}`;

                    const artifactMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ color: data.goal ? 0xFF0000 : 0xFFD700, metalness: 0.9, roughness: 0.1, emissive: data.goal ? 0x990000 : 0xAA8800, emissiveIntensity: 0.5 }));
                    artifactMesh.position.y = 10;
                    base.add(artifactMesh);

                    const glassCase = new THREE.Mesh(new THREE.BoxGeometry(32, 25, 32), new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.1, roughness: 0, metalness: 0, transmission: 0.9, reflectivity: 0.5 }));
                    glassCase.position.y = 17.5;
                    base.add(glassCase);

                    base.userData.markerPosition = base.position.clone();
                    base.userData.markerPosition.y += 35;
                    state.scene!.add(base);
                }
                
                // Markers
                const container = markersContainerRef.current;
                if(container){
                    for (const name in artifacts) {
                        const data = artifacts[name as keyof typeof artifacts];
                        const markerDiv = document.createElement('div');
                        markerDiv.className = 'artifact-marker';
                        markerDiv.id = `marker-${name}`;
                        markerDiv.innerHTML = `<i class="${data.icon}"></i><span class="marker-title">${data.title}</span>`;
                        markerDiv.style.display = 'none';
                        markerDiv.onclick = () => showInfoPanel(name);
                        container.appendChild(markerDiv);
                        state.markersMap[name] = markerDiv;
                    }
                }

                animate(performance.now());

            } catch (error: any) {
                alertMessage("فشل تشغيل المتحف: " + error.message, 'error');
            }
        };

        init();

        const onStartClick = () => {
            if (blockerRef.current) blockerRef.current.classList.add('hidden');
            if (joystickRef.current) joystickRef.current.classList.remove('hidden');
            state.isBlocked = false;
            if (state.renderer) state.renderer.domElement.focus();
            document.getElementById('report-button')?.classList.remove('hidden');
            alertMessage('بدأ التجول! استخدمي الماوس أو اللمس للدوران والنظر حولكِ.', 'success');
        };

        const onMouseDown = (event: MouseEvent) => {
            if (state.isBlocked || state.isReportVisible) return;
            event.preventDefault();
            state.isDragging = true;
            state.onMouseDownMouseX = event.clientX;
            state.onMouseDownMouseY = event.clientY;
            state.onMouseDownLon = state.lon;
            state.onMouseDownLat = state.lat;
        };
        const onMouseMove = (event: MouseEvent) => {
            if (state.isBlocked || state.isReportVisible || !state.isDragging) return;
            event.preventDefault();
            const deltaX = event.clientX - state.onMouseDownMouseX;
            const deltaY = event.clientY - state.onMouseDownMouseY;
            state.lon = state.onMouseDownLon - deltaX * 0.1;
            state.lat = Math.max(-85, Math.min(85, state.onMouseDownLat - deltaY * 0.1));
        };
        const onMouseUp = () => {
            if (state.isBlocked || state.isReportVisible) return;
            state.isDragging = false;
        };

        const onTouchStart = (event: TouchEvent) => {
            if (state.isBlocked || state.isReportVisible || event.touches.length !== 1) return;
            event.preventDefault();
            state.isDragging = true;
            const touch = event.touches[0];
            state.onMouseDownMouseX = touch.clientX;
            state.onMouseDownMouseY = touch.clientY;
            state.onMouseDownLon = state.lon;
            state.onMouseDownLat = state.lat;
        };
        const onTouchMove = (event: TouchEvent) => {
            if (state.isBlocked || state.isReportVisible || !state.isDragging || event.touches.length !== 1) return;
            event.preventDefault();
            const touch = event.touches[0];
            const deltaX = touch.clientX - state.onMouseDownMouseX;
            const deltaY = touch.clientY - state.onMouseDownMouseY;
            state.lon = state.onMouseDownLon - deltaX * 0.2;
            state.lat = Math.max(-85, Math.min(85, state.onMouseDownLat - deltaY * 0.2));
        };
        const onTouchEnd = () => {
            if (state.isBlocked || state.isReportVisible) return;
            state.isDragging = false;
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) event.preventDefault();
            if (state.isBlocked || state.isReportVisible) return;
            state.isMoving = true;
            switch (event.code) {
                case 'KeyW': state.moveForward = true; break;
                case 'KeyA': state.moveLeft = true; break;
                case 'KeyS': state.moveBackward = true; break;
                case 'KeyD': state.moveRight = true; break;
            }
        };
        const onKeyUp = (event: KeyboardEvent) => {
            if (state.isBlocked || state.isReportVisible) return;
            switch (event.code) {
                case 'KeyW': state.moveForward = false; break;
                case 'KeyA': state.moveLeft = false; break;
                case 'KeyS': state.moveBackward = false; break;
                case 'KeyD': state.moveRight = false; break;
            }
            if (!state.moveForward && !state.moveBackward && !state.moveLeft && !state.moveRight) {
                state.isMoving = false;
            }
        };

        const onWindowResize = () => {
            if (state.camera && state.renderer) {
                state.camera.aspect = window.innerWidth / window.innerHeight;
                state.camera.updateProjectionMatrix();
                state.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        
        // --- Joystick Logic ---
        const onJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
            e.preventDefault();
            state.joystickActive = true;
            const touch = 'touches' in e ? e.touches[0] : e;
            state.joystickStartX = touch.clientX;
            state.joystickStartY = touch.clientY;
        };

        const onJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
            if (!state.joystickActive) return;
            e.preventDefault();
            
            const handle = joystickHandleRef.current;
            if (!handle) return;

            const touch = 'touches' in e ? e.touches[0] : e;
            const deltaX = touch.clientX - state.joystickStartX;
            const deltaY = touch.clientY - state.joystickStartY;
            const distance = Math.min(60, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
            const angle = Math.atan2(deltaY, deltaX);

            handle.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px)`;

            // Dead zone
            if (distance < 10) {
                 state.moveForward = state.moveBackward = state.moveLeft = state.moveRight = false;
                 return;
            }

            // Determine direction
            const threshold = Math.PI / 4; // 45 degrees
            state.moveForward = (angle > -Math.PI + threshold && angle < -threshold);
            state.moveBackward = (angle > threshold && angle < Math.PI - threshold);
            state.moveLeft = (angle >= Math.PI - threshold || angle <= -Math.PI + threshold);
            state.moveRight = (angle >= -threshold && angle <= threshold);
        };

        const onJoystickEnd = (e: React.TouchEvent | React.MouseEvent) => {
            e.preventDefault();
            state.joystickActive = false;
            state.moveForward = state.moveBackward = state.moveLeft = state.moveRight = false;
            if (joystickHandleRef.current) {
                joystickHandleRef.current.style.transform = 'translate(0px, 0px)';
            }
        };

        const rendererDom = state.renderer?.domElement;
        document.getElementById('start-button')?.addEventListener('click', onStartClick);
        if (rendererDom) {
            rendererDom.addEventListener('mousedown', onMouseDown);
            rendererDom.addEventListener('mousemove', onMouseMove);
            rendererDom.addEventListener('mouseup', onMouseUp);
            rendererDom.addEventListener('touchstart', onTouchStart, { passive: false });
            rendererDom.addEventListener('touchmove', onTouchMove, { passive: false });
            rendererDom.addEventListener('touchend', onTouchEnd);
        }
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        window.addEventListener('resize', onWindowResize);
        
        return () => {
            window.removeEventListener('resize', onWindowResize);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            if (rendererDom) {
                rendererDom.removeEventListener('mousedown', onMouseDown);
                rendererDom.removeEventListener('mousemove', onMouseMove);
                rendererDom.removeEventListener('mouseup', onMouseUp);
                rendererDom.removeEventListener('touchstart', onTouchStart);
                rendererDom.removeEventListener('touchmove', onTouchMove);
                rendererDom.removeEventListener('touchend', onTouchEnd);
                try{
                    currentMount.removeChild(rendererDom);
                } catch(e) {
                    // ignore if already removed
                }
            }
        };
    }, [state, animate, alertMessage, showInfoPanel, hideInfoPanel, artifacts]);

    const handleTogglePuzzle = () => {
        const puzzleContent = infoPanelRef.current?.querySelector('#puzzle-content');
        puzzleContent?.classList.toggle('hidden');
        if (state.currentArtifactName) {
             setArtifacts(prev => {
                const newArtifacts = { ...prev };
                newArtifacts[state.currentArtifactName!].isExplored = true;
                return newArtifacts;
             });
        }
    };
    
    const speakArtifactDescription = async () => {
        if (!state.currentArtifactName) return;
        const artifact = artifacts[state.currentArtifactName];
        if (!artifact) return;

        setIsSpeaking(true);
        toast({ title: 'المرشد الصوتي يتحدث...', description: 'جاري توليد الوصف الصوتي للقطعة الأثرية.' });
        
        try {
            const result = await getSpeechAudio(artifact.description);
            if (result.error || !result.media) {
                throw new Error(result.error || 'لم يتم إرجاع أي مقطع صوتي.');
            }
            const audio = new Audio(result.media);
            audio.play();
            audio.onended = () => setIsSpeaking(false);
            toast({ title: 'تم!', description: `تشغيل وصف: "${artifact.title}"` });
        } catch (error) {
            console.error("Error playing audio:", error);
            toast({
                variant: 'destructive',
                title: '❌ خطأ في توليد الصوت',
                description: (error as Error).message,
            });
            setIsSpeaking(false);
        }
    };

    const updateReportContent = useCallback(() => {
        const modal = reportModalRef.current;
        if (!modal) return;

        const statusListContainer = modal.querySelector('#artifact-status-list');
        if(!statusListContainer) return;
        
        statusListContainer.innerHTML = '';
        let exploredCount = 0;
        let isGoalAchieved = false;

        Object.entries(artifacts).forEach(([name, data]) => {
            if (data.isExplored) {
                exploredCount++;
                if (data.goal) isGoalAchieved = true;
            }
            const item = document.createElement('div');
            item.className = 'artifact-status-item';
            const statusHtml = data.isExplored ? `<span class="achieved-icon"><i class="fas fa-check-circle ml-1"></i> تم الاستكشاف</span>` : `<span class="pending-icon"><i class="fas fa-circle-notch ml-1"></i> لم يُفتح اللغز</span>`;
            const goalTag = data.goal ? `<span class="text-sm font-bold text-red-500 bg-red-900 px-2 py-1 rounded-full mr-2">هدف رئيسي</span>` : '';
            item.innerHTML = `<div class="flex items-center"><span class="font-extrabold text-white text-lg">${data.title}</span>${goalTag}</div>${statusHtml}`;
            statusListContainer.appendChild(item);
        });

        (modal.querySelector('#explored-count') as HTMLElement).textContent = exploredCount.toString();
        const goalStatusElement = (modal.querySelector('#goal-status') as HTMLElement);
        const goalTextElement = (modal.querySelector('#goal-text') as HTMLElement);

        if (isGoalAchieved) {
            goalTextElement.textContent = 'تم إيجاده بنجاح!';
            goalStatusElement.classList.replace('text-red-400', 'text-green-400');
        } else {
            goalTextElement.textContent = 'لم يتم الوصول إليه بعد';
            goalStatusElement.classList.replace('text-green-400', 'text-red-400');
        }
    }, [artifacts]);

    const showReportModal = () => {
        if(reportModalRef.current) reportModalRef.current.style.display = 'flex';
        state.isReportVisible = true;
        state.isBlocked = true;
        updateReportContent();
    };

    const hideReportModal = () => {
        if(reportModalRef.current) reportModalRef.current.style.display = 'none';
        state.isReportVisible = false;
        state.isBlocked = false;
        if (state.renderer) state.renderer.domElement.focus();
    };
    
    return (
        <div ref={mountRef} className="museum-body">
            <div ref={infoPanelRef} id="info-panel">
                <h2 id="artifact-title" className="text-xl font-extrabold mb-2 border-b border-[#D4AF37] pb-1 text-[#FFD700]"></h2>
                <p id="artifact-description" className="text-sm mb-4 text-gray-200"></p>
                <div id="puzzle-content" className="bg-gray-800 p-3 rounded-lg text-white mb-4 hidden">
                    <h3 className="font-bold text-base mb-1 text-yellow-300">لغز اليوم:</h3>
                    <p id="puzzle-text" className="text-sm"></p>
                </div>
                <div className="flex flex-col space-y-3 mt-4">
                    <button id="speak-description" onClick={speakArtifactDescription} className="info-button bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSpeaking}>
                        {isSpeaking ? <span className="spinner"></span> : <i className="fas fa-volume-up ml-2"></i>}
                        {isSpeaking ? 'جاري التحدث...' : 'استمع للوصف'}
                    </button>
                    <button id="toggle-puzzle" onClick={handleTogglePuzzle} className="info-button bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-md">
                        <i className="fas fa-brain ml-2"></i> لغز اليوم
                    </button>
                    <button id="close-panel" onClick={hideInfoPanel} className="info-button bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md">
                        <i className="fas fa-times ml-2"></i> إغلاق
                    </button>
                </div>
            </div>

            <div ref={markersContainerRef} id="markers-container"></div>
             
             <div 
                ref={joystickRef} 
                id="joystick-container"
                className="hidden fixed bottom-10 left-10 w-32 h-32 bg-black bg-opacity-30 rounded-full z-20"
                onTouchStart={e => state.isBlocked ? null : onJoystickStart(e)}
                onTouchMove={e => state.isBlocked ? null : onJoystickMove(e)}
                onTouchEnd={e => state.isBlocked ? null : onJoystickEnd(e)}
             >
                <div 
                    ref={joystickHandleRef}
                    id="joystick-handle" 
                    className="absolute top-1/2 left-1/2 w-16 h-16 bg-gold-accent bg-opacity-50 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100"
                ></div>
            </div>

            <button id="report-button" onClick={showReportModal} className="py-2 px-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg hidden fixed top-2.5 right-2.5 z-10">
                <i className="fas fa-graduation-cap ml-2"></i> تقرير الطالب
            </button>

            <div ref={reportModalRef} id="academic-report-modal">
                <div className="report-card">
                    <h1 className="text-4xl font-extrabold text-[#FFD700] mb-6 border-b pb-3">لوحة التقارير الأكاديمية</h1>
                    <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-inner">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-3">ملخص الإنجاز</h2>
                        <div id="achievement-summary" className="text-lg">
                            <p className="mb-2"><i className="fas fa-scroll ml-2 text-yellow-500"></i> عدد التحف التي تم استكشافها: <span id="explored-count" className="font-extrabold text-white">0</span> / 8</p>
                            <p id="goal-status" className="font-extrabold text-red-400 transition-colors">
                                <i className="fas fa-flag ml-2"></i> حالة الهدف الرئيسي (حجر رشيد): <span id="goal-text">لم يتم الوصول إليه بعد</span>
                            </p>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-400 mt-6 mb-3 border-b pb-2">حالة ألغاز التحف</h2>
                    <div id="artifact-status-list"></div>
                    <h2 className="text-2xl font-bold text-yellow-400 mt-8 mb-3 border-b pb-2">مصادر التعلم (Citations)</h2>
                    <div id="citations-list" className="bg-gray-800 p-4 rounded-lg text-sm space-y-2">
                        <p className="text-gray-400 italic" id="citation-placeholder">البيانات هنا سيتم تزويدها من الواجهة الخلفية (Back-End) بمجرد ربطها بـ Google Search API. حالياً لا توجد مصادر.</p>
                    </div>
                    <button id="close-report-modal" onClick={hideReportModal} className="mt-8 py-3 px-8 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg transform hover:scale-105">
                        <i className="fas fa-times ml-2"></i> إغلاق التقرير والعودة للمتحف
                    </button>
                </div>
            </div>

            <div ref={blockerRef} id="blocker">
                <h1 className="font-extrabold text-5xl text-[#FFD700] mb-8" style={{ fontFamily: "'El Messiri', sans-serif" }}>المتحف الفرعوني الافتراضي</h1>
                <button id="start-button" className="py-4 px-10 bg-yellow-600 text-black font-bold text-2xl rounded-xl hover:bg-yellow-500 transition-colors shadow-2xl transform hover:scale-105" style={{ fontFamily: "'El Messiri', sans-serif" }}>
                    انقر للبدء في التجول
                </button>
                <div id="control-instructions" className="text-white mt-12 text-lg p-4 bg-gray-800 bg-opacity-70 rounded-lg">
                    <p className="font-bold text-xl mb-2 text-[#FFD700]">دليل التحكم والرموز:</p>
                    <p><strong>الحركة:</strong> استخدم عصا التحكم (Joystick) على الشاشة أو أزرار W/A/S/D.</p>
                    <p><strong>النظر/الدوران:</strong> <span className="text-yellow-400">اضغط بزر الماوس الأيسر واسحب</span> أو <span className="text-yellow-400">اسحب بالإصبع</span> (ضروري لرؤية جميع التحف)</p>
                    <p><strong>التفاعل:</strong> ابحث عن الرموز الذهبية وانقر عليها لاستكشاف التحف الثمانية.</p>
                </div>
            </div>
        </div>
    );
}

    
