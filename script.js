document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const taskInput = document.getElementById('taskInput');
            const addTaskBtn = document.getElementById('addTaskBtn');
            const columns = document.querySelectorAll('.task-column');
            
            let draggedTask = null;

            // --- FUNCTIONS ---

            // Function to create a new task element
            const createTaskElement = (taskText) => {
                const task = document.createElement('div');
                task.className = 'bg-white p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-shadow duration-200 flex justify-between items-center';
                task.draggable = true;

                const taskContent = document.createElement('p');
                taskContent.className = 'text-slate-700 break-words';
                taskContent.textContent = taskText;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'text-slate-400 hover:text-red-500 transition-colors ml-2 p-1';
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent drag from starting on delete
                    task.remove();
                    saveTasks();
                });

                task.appendChild(taskContent);
                task.appendChild(deleteBtn);

                // Attach drag and drop event listeners
                task.addEventListener('dragstart', handleDragStart);
                task.addEventListener('dragend', handleDragEnd);

                return task;
            };

            // Function to add a new task
            const addTask = () => {
                const taskText = taskInput.value.trim();
                if (taskText) {
                    const newTask = createTaskElement(taskText);
                    document.querySelector('[data-status="todo"]').appendChild(newTask);
                    taskInput.value = '';
                    taskInput.focus();
                    saveTasks();
                }
            };
            
            // --- DRAG & DROP HANDLERS ---
            
            const handleDragStart = (e) => {
                draggedTask = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            };

            const handleDragEnd = (e) => {
                e.target.classList.remove('dragging');
                draggedTask = null;
                saveTasks();
            };

            const handleDragOver = (e) => {
                e.preventDefault(); // This is necessary to allow dropping
                const column = e.currentTarget;
                const afterElement = getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(draggedTask);
                } else {
                    column.insertBefore(draggedTask, afterElement);
                }
            };

            // Helper function to find position to insert the dragged task
            const getDragAfterElement = (container, y) => {
                const draggableElements = [...container.querySelectorAll('.bg-white:not(.dragging)')];

                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            };

            // --- LOCAL STORAGE ---

            // Function to save tasks to local storage
            const saveTasks = () => {
                const tasksByColumn = {};
                columns.forEach(column => {
                    const status = column.getAttribute('data-status');
                    const tasks = [...column.querySelectorAll('.bg-white p')].map(p => p.textContent);
                    tasksByColumn[status] = tasks;
                });
                localStorage.setItem('taskManagerTasks', JSON.stringify(tasksByColumn));
            };

            // Function to load tasks from local storage
            const loadTasks = () => {
                const savedTasks = localStorage.getItem('taskManagerTasks');
                if (savedTasks) {
                    const tasksByColumn = JSON.parse(savedTasks);
                    for (const status in tasksByColumn) {
                        const column = document.querySelector(`[data-status="${status}"]`);
                        if (column) {
                            tasksByColumn[status].forEach(taskText => {
                                const taskElement = createTaskElement(taskText);
                                column.appendChild(taskElement);
                            });
                        }
                    }
                }
            };

            // --- EVENT LISTENERS ---

            // Add task button click
            addTaskBtn.addEventListener('click', addTask);
            
            // Allow pressing Enter to add a task
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTask();
                }
            });

            // Add dragover listeners to each column
            columns.forEach(column => {
                column.addEventListener('dragover', handleDragOver);
            });

            // Initial load of tasks from local storage
            loadTasks();
        });