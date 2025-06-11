import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, TextField, DialogActions, Select, MenuItem } from '@material-ui/core';
import MaterialTable from 'material-table';
import NavBar from './NavBar';
import './App.css';

//Class and CohortData types
type Class = {
    classDepartment: string;
    classNumber: string;
}

type CohortData = {
    id: number;
    program: string;
    semesterNumber: string;
    classes: Class[];
}

function Cohort() {
    const [open, setOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editId, setEditId] = useState(0);
    const [program, setProgram] = useState('');
    const [semester, setSemester] = useState('');
    const [classes, setClasses] = useState<Class[]>([]);
    const [cohortsData, setCohortsData] = useState<CohortData[]>([]); // used for displaying cohorts
    
    const [selectedClasses, setSelectedClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentClassIndex, setCurrentClassIndex] = useState<string | null>(null); // so we can handle the dropdown in the add class dialog

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch('http://localhost:3001/cohort').then(response => response.json()),
            fetch('http://localhost:3001/class/Unique').then(response => response.json()),
        ])
        .then(([cohortData, classData]) => {
            setCohortsData(cohortData);
            setClasses(classData);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        console.log('currentClassIndex:', currentClassIndex);
    }, [currentClassIndex]);

    useEffect(() => {
        console.log('selectedClasses:', selectedClasses);
    }, [selectedClasses]);

    //Form submission handlers
    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEdit = (id: number) => {
        setEditId(id);
        const selectedCohort = cohortsData.find(cohortItem => cohortItem.id === id);
        setProgram(selectedCohort!.program)
        setSemester(selectedCohort!.semesterNumber)
        setSelectedClasses(selectedCohort!.classes)
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleAddClass = () => {
        console.log('handleAddClass called');
        const selectedClass = classes.find(c => c.classDepartment + ' ' + c.classNumber === currentClassIndex);
        console.log('selectedClass:', selectedClass);
        if (selectedClass) {
            setSelectedClasses(prevClasses => [...prevClasses, selectedClass]);
            setCurrentClassIndex('');
        }
    };

    const handleSubmit = async () => {
        try {
            if (!program || !semester) {
                console.error('Program and semester are required.'); // Error message sent when no program or semester is input in 'Add Cohort' sub-window
                return;
            }

            const cohortData = {
                program: program,
                semesterNumber: semester,
                classes: selectedClasses,
            };

            const response = await fetch('http://localhost:3001/cohort', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cohortData),
            });

            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }

            const cohortsResponse = await fetch('http://localhost:3001/cohort');
            const cohortsData = await cohortsResponse.json();
            setCohortsData(cohortsData);
            setOpen(false);
        } catch (error) {
            console.error('Unable to submit cohort:', error);
        }
    };

    const handleSubmitEdit = async () => {
        try {
            if (!program || !semester) {
                console.error('Program and semester are required.');
                return;
            }

            const cohortData = {
                program: program,
                semesterNumber: semester,
                classes: selectedClasses,
            };

            const response = await fetch('http://localhost:3001/cohort/' + editId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cohortData),
            });

            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }

            const cohortsResponse = await fetch('http://localhost:3001/cohort');
            const cohortsData = await cohortsResponse.json();
            setCohortsData(cohortsData);
            handleCloseEdit();
        } catch (error) {
            console.error('Unable to submit cohort:', error);
        }
    };

    const deleteCohort = async (id: number) => {
        try {
            await fetch(`http://localhost:3001/cohort/${id}`, {
                method: 'DELETE',
            });

            setCohortsData(prevData => prevData.filter(cohortData => cohortData.id !== id));
        } catch (error) {
            console.error('Unable to delete cohort:', error);
        }
    };

    const handleDeleteClass = (classDepartment: string, classNumber: string) => {
        setSelectedClasses(prevClasses =>
            prevClasses.filter(c => c.classDepartment !== classDepartment || c.classNumber !== classNumber)
        );
    };

    return (
        <div style={{ width: '100%', margin: 0, position: 'absolute', top: 0 }}>
            <NavBar />
            <div className="tab-bar">
                <Button color="primary" onClick={handleOpen} className="tab">
                    Add Cohort
                </Button>
            </div>
            <MaterialTable
                title=""
                columns={[
                    { title: 'Program', field: 'program', cellStyle: { fontSize: '12px', width: '10%' } },
                    { title: 'Semester #', field: 'semesterNumber', cellStyle: { fontSize: '12px', width: '10%' } },
                    { title: 'Classes', field: 'classes', render: rowData => rowData.classes.map(c => `${c.classDepartment} ${c.classNumber}`).join(', '), cellStyle: { fontSize: '12px', width: '10%' } },
                ]}
                data={cohortsData}
                actions={[
                    {
                        icon: 'edit',
                        tooltip: 'Edit Cohort',
                        onClick: (event, rowData) => handleOpenEdit((rowData as CohortData).id),
                    },
                    {
                        icon: 'delete',
                        tooltip: 'Delete Cohort',
                        onClick: (event, rowData) => deleteCohort((rowData as CohortData).id),
                    }
                ]}
                options={{
                    actionsColumnIndex: -1,
                }}
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Cohort</DialogTitle>
                <DialogContent>
                    <div>
                        <FormControl> {/* Add Cohort Selection: 'Program'  Dropdown which is needed to be filled to create Cohort with only three slections at the moment, EE, CPRE, CYB E*/}
                            Program
                            <Select value={program} onChange={e => setProgram(e.target.value as string)}>
                                <MenuItem value="EE">EE</MenuItem>
                                <MenuItem value="CPRE">CPRE</MenuItem>
                                <MenuItem value="CYB E">CYB E</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <br></br>
                    <div>
                        Semester #<br></br>
                        <TextField label="Ex: 3" value={semester} onChange={e => setSemester(e.target.value)} /> {/* Add Cohort Selection: 'Semester #'  TextField which needs to be filled to create Cohort */}
                    </div>
                    <div>
                        <FormControl> {/* Add Cohort Selection: 'Class' and 'ADD CLASS' Dropdown file and add class button which will be used to add a specific class to the cohort, NOTE: still needs work*/}
                            <InputLabel>Class</InputLabel>
                            <Select value={currentClassIndex || ''} onChange={e => setCurrentClassIndex(e.target.value as string)}>
                                {classes.filter(c => !selectedClasses.some(sc => sc.classDepartment === c.classDepartment && sc.classNumber === c.classNumber)).map((c) => (
                                    <MenuItem value={`${c.classDepartment} ${c.classNumber}`} key={`${c.classDepartment} ${c.classNumber}`}>
                                        {`${c.classDepartment} ${c.classNumber}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button onClick={handleAddClass}>Add Class</Button>
                        </FormControl>
                    </div>

                    <div>
                        <br></br>
                        <div>
                            <br></br>
                                 <h3>Cohort Classes:</h3> {/* Add Cohort Selection: List of classes related to the Cohort */}
                                     {selectedClasses.map(c => (
                                    <div key={`${c.classDepartment} ${c.classNumber}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                     {`${c.classDepartment} ${c.classNumber}`}
                                    <Button onClick={() => handleDeleteClass(c.classDepartment, c.classNumber)} style={{ marginLeft: '10px' }}>Delete</Button>
                            </div>
                                    ))}
                        </div>
                    </div>

                </DialogContent>
                <DialogActions> {/* Add Cohort Selection: 'CANCEL' and 'SUBMIT'  Buttons that exit the sub-window or exits and adds Cohort to the list */}
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openEdit} onClose={handleCloseEdit}>
                <DialogTitle>Edit Cohort</DialogTitle>
                <DialogContent>
                    <div>
                        <FormControl>
                            Program
                            <Select value={program} onChange={e => setProgram(e.target.value as string)}>
                                <MenuItem value="EE">EE</MenuItem>
                                <MenuItem value="CPRE">CPRE</MenuItem>
                                <MenuItem value="CYB E">CYB E</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <br></br>
                    <div>
                        Semester #<br></br>
                        <TextField label="Ex: 3" value={semester} onChange={e => setSemester(e.target.value)} />
                    </div>
                    <div>
                        <FormControl>
                            <InputLabel>Class</InputLabel>
                            <Select value={currentClassIndex || ''} onChange={e => setCurrentClassIndex(e.target.value as string)}>
                                {classes.filter(c => !selectedClasses.some(sc => sc.classDepartment === c.classDepartment && sc.classNumber === c.classNumber)).map((c) => (
                                    <MenuItem value={`${c.classDepartment} ${c.classNumber}`} key={`${c.classDepartment} ${c.classNumber}`}>
                                        {`${c.classDepartment} ${c.classNumber}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Button onClick={handleAddClass}>Add Class</Button>
                        </FormControl>
                    </div>

                    <div>
                        <br></br>
                        <div>
                            <br></br>
                            <h3>Cohort Classes:</h3>
                                {selectedClasses.map(c => (
                                <div key={`${c.classDepartment} ${c.classNumber}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {`${c.classDepartment} ${c.classNumber}`}
                                <Button onClick={() => handleDeleteClass(c.classDepartment, c.classNumber)} style={{ marginLeft: '10px' }}>Delete</Button>
                                </div>
                                ))}
                        </div>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitEdit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Cohort;
