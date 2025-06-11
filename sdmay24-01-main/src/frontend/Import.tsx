import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, InputLabel, MenuItem, FormControl, TextField, Select, DialogActions } from '@material-ui/core';
import MaterialTable from 'material-table';
import NavBar from './NavBar';
import './App.css';

type ImportClass = {
  id: number;
  class: { classDepartment: string; classNumber: number }[];
}

function Imports() {

  const [open, setOpen] = useState(false);
  const [importsData, setImportsData] = useState<ImportClass[]>([]);
  const [classDepartment, setClassDepartment] = useState('');
  const [classNumber, setClassNumber] = useState('');
  //These are set based on values from classes.iastate.edu and get the available departments and semesters
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<{ id: number; semesterTitle: string }[]>([]);

  const [openImportSettings, setOpenImportSettings] = useState(false);
  const [importPreferences, setImportPreferences] = useState<{ semester_id: number; semester_name: string } | null>(null);
  const [selectedSemester, setSelectedSemester] = useState('');


  useEffect(() => {
    const fetchImports = async () => {
      try {
        const response = await fetch('http://localhost:3001/import');
        const data = await response.json();
        setImportsData(data);
      } catch (error) {
        console.error('Unable to fetch imports:', error);
      }
    };

    const fetchFormDefaults = async () => {
      try {
        const response = await fetch('http://localhost:3001/import/formDefaults');
        const data = await response.json();
        setDepartments(data.departments);
        setSemesters(data.semesters);
        console.log('Departments:', data.departments);
      console.log('Semesters:', data.semesters);
      } catch (error) {
        console.error('Unable to fetch form defaults:', error);
      }
    };

    fetchImports();
    fetchFormDefaults();
  }, []);

  const deleteImport = async (id: number) => {
    try {
      await fetch(`http://localhost:3001/import/${id}`, {
        method: 'DELETE',
      });
      setImportsData(prevData => prevData.filter(importClass => importClass.id !== id));
    } catch (error) {
      console.error('Unable to delete import:', error);
    }
  };

  /* Form submission handlers */
  //open for new import dialog
  const handleOpen = () => {
    setOpen(true);
  };
  //close for new import dialog
  const handleClose = () => {
    setOpen(false);
    setClassDepartment(''); // Reset the classDepartment input field
    setClassNumber(''); // Reset the classNumber input field
  };

  const handleOpenImportSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/import/importPreferences');
      const data = await response.json();
      setImportPreferences({ semester_id: data.semester_id, semester_name: data.semester_name });
      setSelectedSemester(`${data.semester_id} - ${data.semester_name}`);
    } catch (error) {
      console.error('Unable to fetch import preferences:', error);
    }
    setOpenImportSettings(true);
  };

  const handleCloseImportSettings = () => {
    setOpenImportSettings(false);
  };
  const handleSemesterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedSemester(event.target.value as string);
  };

  const handleSubmit = async () => {
    try {
    //Not sure if necessary for imports
      if (!classDepartment || !classNumber) {
        console.error('Department and Class Number are required.');
        return;
      }

      const importData = {
        class: [
          {
            classDepartment,
            classNumber
          }
        ]
      };

      const response = await fetch('http://localhost:3001/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      });

      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }

      const importsResponse = await fetch('http://localhost:3001/import');
      const importsData = await importsResponse.json();
      setImportsData(importsData);
      console.log('import created successfully');
    } catch (error) {
      console.error('Unable to create import:', error);
    }

    handleClose();
  };
  const handleRefresh = async () => {
    console.log('handleRefresh called');
    try {
      const classes = importsData.flatMap(item => item.class);

      const response = await fetch('http://localhost:3001/import/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classes),
      });

      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }

      console.log('Courses refreshed successfully');
    } catch (error) {
      console.error('Unable to refresh courses:', error);
    }
  };
  const handleSubmitSettings = async () => {
    const [semester_id, semester_name] = selectedSemester.split(' - ');
    try {
      const response = await fetch('http://localhost:3001/import/importPreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ semester_id: Number(semester_id), semester_name }),
      });
      const data = await response.json();
      console.log('Import preferences updated:', data);
    } catch (error) {
      console.error('Unable to update import preferences:', error);
    }
    handleCloseImportSettings();
  };

  return (
    <div style={{ width: '100%', margin: 0, position: 'absolute', top: 0 }}>
      <NavBar />
      <div className="tab-bar">
        <Button color="primary" onClick={handleOpen} className="tab">
          Add Import
        </Button>
        <Button color="primary" onClick={handleOpenImportSettings}>Import Settings</Button> {/* 'IMPORT SETTINGS' currently has only two options for the spring and summer semester  */}
        <Button color="primary" style={{ marginLeft: 'auto' }} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
      <MaterialTable
        title=""
        columns={[
          { title: 'Department', field: 'class[0].classDepartment' },
          { title: 'Class Number', field: 'class[0].classNumber', type: 'numeric' },
          { title: '', field: '' }, // Placeholder for delete button
        ]}
        data={importsData}
        actions={[
          {
            icon: 'delete',
            tooltip: 'Delete Import',
            onClick: (event, rowData) => deleteImport((rowData as ImportClass).id),
          },
        ]}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Import</DialogTitle> {/* Add Import Selection: 'ADD IMPORT'  Button to open the sub-window which adds a department and class to the list of Imports */}
        <DialogContent>
        <FormControl fullWidth>
      <InputLabel id="classDepartment-label">Department</InputLabel>
      <Select
        labelId="classDepartment-label"
        id="classDepartment"
        value={classDepartment}
        onChange={(event) => setClassDepartment(event.target.value as string)} /* Add Import Selection: 'Department'  dropdown used to select a class department */
      >
        {departments.map((department) => (
          <MenuItem key={department} value={department}>
            {department}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
          <TextField
            margin="dense"
            id="classNumber"
            label="Class Number"
            type="text"
            fullWidth
            value={classNumber}
            onChange={(event) => setClassNumber(event.target.value)} /* Add Import Selection: 'Class Number'  TextField used to set the class number of an Import */
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openImportSettings} onClose={handleCloseImportSettings}>
        <DialogTitle>Import Settings</DialogTitle>
        <DialogContent>
          <FormControl>
            <InputLabel htmlFor="semester-select">Semester</InputLabel>
            <Select
              native
              value={selectedSemester}
              onChange={handleSemesterChange}
              inputProps={{
                name: 'semester',
                id: 'semester-select',
              }}
            >
              {semesters.map((semester) => {
                const semesterOption = `${semester.id} - ${semester.semesterTitle}`;
                return (
                  <option key={semester.id} value={semesterOption}>
                    {semesterOption}
                  </option>
                );
              })}
            </Select>
          </FormControl>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportSettings} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmitSettings} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

        export default Imports;