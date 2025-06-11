import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem } from '@material-ui/core';
import MaterialTable from 'material-table';
import NavBar from './NavBar';
import './App.css';

// Define your ClassTime and ClassData types as before...
type ClassTime = {
  day: string;
  startTime: string;
  endTime: string;
};

type ClassData = {
  id: number;
  classDepartment: string;
  classNumber: string;
  section: string;
  classTimes: ClassTime[];
};
// Create a custom component to render class times
const ClassTimesCell = (classTimes: ClassTime[]) => (
  <div>
    {classTimes.map((classTime, index) => (
      <div key={index}>
        {`${classTime.day} ${classTime.startTime}-${classTime.endTime}`}
      </div>
    ))}
  </div>
);

function Classes() {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(0);
  const [classDepartment, setClassDepartment] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [classTimes, setClassTimes] = useState<ClassTime[]>([{ day: '', startTime: '', endTime: '' }]);
  const [section, setSection] = useState('');
  const [classesData, setClassesData] = useState<ClassData[]>([]); //used for displaying classes
  
/* This useEffect hook is used to fetch the classes from the backend when the page loads. */  
useEffect(() => {
  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:3001/class');
      const data = await response.json();
      setClassesData(data);
    } catch (error) {
      console.error('Unable to fetch classes:', error);
    }
  };

  fetchClasses();
}, []);
const deleteClass = async (id: number) => {
try {
  await fetch(`http://localhost:3001/class/${id}`, {
    method: 'DELETE',
  });
  setClassesData(classesData.filter(classData => classData.id !== id));
} catch (error) {
  console.error('Unable to delete class:', error);
}
};
/* Form submission handlers */
const handleOpen = () => {
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
};

const handleOpenEdit = (id: number) => {
  const selectedClass = classesData.find(classItem => classItem.id === id);
  setEditId(id);
  setClassDepartment(selectedClass!.classDepartment)
  setClassNumber(selectedClass!.classNumber)
  setClassTimes(selectedClass!.classTimes)
  setSection(selectedClass!.section)
  setOpenEdit(true);
};

const handleCloseEdit = () => {
  setOpenEdit(false);
};
const handleSubmit = async () => {
  try {
    const classData = {
      classDepartment,
      classNumber,
      section,
      classTimes
    };

    const response = await fetch('http://localhost:3001/class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    // Fetch classes data again after the class is created
  const classesResponse = await fetch('http://localhost:3001/class');
  const classesData = await classesResponse.json();
  setClassesData(classesData);
    console.log('Class created successfully');
  } catch (error) {
    console.error('Unable to create class:', error);
  }
  
  handleClose();
};

const handleSubmitEdit = async () => {
  try {
    const classData = {
      classDepartment,
      classNumber,
      section,
      classTimes
    };

    const response = await fetch('http://localhost:3001/class/' + editId , {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(classData)
    });

    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    // Fetch classes data again after the class is updated
    const classesResponse = await fetch('http://localhost:3001/class');
    const classesData = await classesResponse.json();
    setClassesData(classesData);
    console.log('Class created successfully');
  } catch (error) {
    console.error('Unable to create class:', error);
  }

  handleCloseEdit();
};

type ClassTimeKey = 'day' | 'startTime' | 'endTime'; // create a type for the keys of ClassTime and use that for the field parameter: ClassTimeKey is a type that can be either 'day', 'startTime', or 'endTime'. This matches the keys of ClassTime. The field parameter of handleClassTimeChange is of type ClassTimeKey, so TypeScript knows that it will be one of the keys of ClassTime.

/*This function is used to handle changes to the day, start time, and end time of a class. 
It takes an index (to identify which class time is being changed), a field (to identify whether the day,
   start time, or end time is being changed), and a value (the new value for the field). 
   It creates a new array of class times, updates the appropriate field of the appropriate class time,
    and then updates the state with the new array. 
    I think this would need to be modified when you actually add the class editor to this
    */
const handleClassTimeChange = (index: number, field: ClassTimeKey, value: string) => {
  const newClassTimes = [...classTimes];
  newClassTimes[index][field] = value;
  setClassTimes(newClassTimes);
};

const addClassTime = () => {
  setClassTimes([...classTimes, { day: '', startTime: '', endTime: '' }]);
};
  return (
    <div style={{ width: '100%', margin: 0, position: 'absolute', top: 0 }}>
      <NavBar />
      <div className="tab-bar">
        <Button color="primary" onClick={handleOpen} className="tab"> {/* Add Class Selection: 'Add Class'  button to go into Secondary window to create classes and set times */}
          Add Class
        </Button>
      </div>
      <MaterialTable
        title=""
        columns={[
          { title: 'DEPT', field: 'classDepartment', cellStyle: { fontSize: '12px', width: '10%' } },
          { title: 'Class #', field: 'classNumber', cellStyle: { fontSize: '12px', width: '10%' } },
          { title: 'Section', field: 'section', cellStyle: { fontSize: '12px', width: '10%' } },
          {
            title: 'Class Times',
            field: 'classTimes',
            sorting: false,
            render: rowData => ClassTimesCell(rowData.classTimes),
            cellStyle: { fontSize: '12px' }
          },
        ]}
        data={classesData}
        actions={[
          {
            icon: 'edit',
            tooltip: 'Edit Class',
            onClick: (event, rowData) => handleOpenEdit((rowData as ClassData).id),
          },
          {
            icon: 'delete',
            tooltip: 'Delete Class',
            onClick: (event, rowData) => deleteClass((rowData as ClassData).id), // Classes Tab : 'Delete (trash icon)'  button under the 'Actions' header for removing created classes from list
          }
        ]}
        options={{
          actionsColumnIndex: -1,
        }}
      />
      <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add Class</DialogTitle>
          <DialogContent>
          <TextField
          autoFocus
          margin="dense"
          label="Class Department"
          type="text"
          fullWidth
          value={classDepartment}
          onChange={(e) => setClassDepartment(e.target.value)} //Add Class Selection: 'Class Department' input text-field
      />
        <TextField
          margin="dense"
          label="Class Number"
          type="number"
          fullWidth
          value={classNumber}
          onChange={(e) => setClassNumber(e.target.value)} //Add Class Selection: 'Class Number' input text-field
        />
                  <TextField
      margin="dense"
      label="Section"
      type="text"
      fullWidth
      value={section}
      onChange={(e) => setSection(e.target.value)} //Add Class Selection: 'Class Section' input text-field
    />
                  {classTimes.map((classTime, index) => (
                    <div key={index}>

                      <Select
                      label="Day"
      value={classTime.day}
      onChange={(e) => handleClassTimeChange(index, 'day', e.target.value as string)} // Note that e.target.value is cast to string because the onChange event can potentially return a string[] for multiple select components, but in this case we know it will only be a string.
    >
      <MenuItem value={'Monday'}>Monday</MenuItem>
      <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
      <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
      <MenuItem value={'Thursday'}>Thursday</MenuItem>
      <MenuItem value={'Friday'}>Friday</MenuItem>
    </Select>
                      {/* Repeat for other days */}
                      <TextField
                        id="time"
                        label="Start Time"
                        type="time"
                        value={classTime.startTime}
                        onChange={(e) => handleClassTimeChange(index, 'startTime', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 min
                        }}
                      />
                      <TextField
                        id="time"
                        label="End Time"
                        type="time"
                        value={classTime.endTime}
                        onChange={(e) => handleClassTimeChange(index, 'endTime', e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 min
                        }}
                      />
                    </div>
                  ))}
                  <Button onClick={addClassTime}>Add Time</Button> {/* Add Class Selection: 'ADD TIME' Adds another day, Start, and End time  */}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary"> {/* Add Class Selection: 'Cancel'  button to exit Add Class Selection */}
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} color="primary"> {/* Add Class Selection: 'Submit'  button to exit and add class to list */}
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Add Class</DialogTitle>
        <DialogContent>
          <TextField
              autoFocus
              margin="dense"
              label="Class Department"
              type="text"
              fullWidth
              value={classDepartment}
              onChange={(e) => setClassDepartment(e.target.value)}
          />
          <TextField
              margin="dense"
              label="Class Number"
              type="number"
              fullWidth
              value={classNumber}
              onChange={(e) => setClassNumber(e.target.value)}
          />
          <TextField
              margin="dense"
              label="Section"
              type="text"
              fullWidth
              value={section}
              onChange={(e) => setSection(e.target.value)}
          />
          {classTimes.map((classTime, index) => (
              <div key={index}>

                <Select
                    label="Day"
                    value={classTime.day}
                    onChange={(e) => handleClassTimeChange(index, 'day', e.target.value as string)} // Note that e.target.value is cast to string because the onChange event can potentially return a string[] for multiple select components, but in this case we know it will only be a string.
                >
                  <MenuItem value={'Monday'}>Monday</MenuItem>
                  <MenuItem value={'Tuesday'}>Tuesday</MenuItem>
                  <MenuItem value={'Wednesday'}>Wednesday</MenuItem>
                  <MenuItem value={'Thursday'}>Thursday</MenuItem>
                  <MenuItem value={'Friday'}>Friday</MenuItem>
                </Select>
                {/* Repeat for other days */}
                <TextField
                    id="time"
                    label="Start Time"
                    type="time"
                    value={classTime.startTime}
                    onChange={(e) => handleClassTimeChange(index, 'startTime', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                />
                <TextField
                    id="time"
                    label="End Time"
                    type="time"
                    value={classTime.endTime}
                    onChange={(e) => handleClassTimeChange(index, 'endTime', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                />
              </div>
          ))}
          <Button onClick={addClassTime}>Add Time</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Classes;