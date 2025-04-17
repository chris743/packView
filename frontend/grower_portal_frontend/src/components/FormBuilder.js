import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  Divider,
  Switch,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  FormHelperText,
  InputAdornment,
  Button,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * Dynamic form builder component that creates form fields from configuration
 * 
 * @param {Object} props
 * @param {Array} props.fields - Form field definitions
 * @param {Object} props.initialValues - Initial form values
 * @param {function} props.onChange - Function called when form values change
 * @param {Object} props.errors - Form validation errors
 * @param {boolean} props.disabled - Whether the entire form is disabled
 * @param {boolean} props.readOnly - Whether the form is in read-only mode
 * @param {Object} props.sx - Additional styles to apply
 * @param {Array} props.sections - Optional form sections
 */
const FormBuilder = ({
  fields = [],
  initialValues = {},
  onChange,
  errors = {},
  disabled = false,
  readOnly = false,
  sx = {},
  sections = null,
}) => {
  const [formValues, setFormValues] = useState({ ...initialValues });

  // Update form when initialValues change
  useEffect(() => {
    setFormValues({ ...initialValues });
  }, [initialValues]);

  // Handle field change
  const handleChange = (name, value) => {
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);
    
    if (onChange) {
      onChange(newValues);
    }
  };

  // Handle array field item change
  const handleArrayItemChange = (name, index, value) => {
    const currentArray = Array.isArray(formValues[name]) ? [...formValues[name]] : [];
    currentArray[index] = value;
    
    handleChange(name, currentArray);
  };

  // Add new item to array field
  const handleAddArrayItem = (name, defaultValue = '') => {
    const currentArray = Array.isArray(formValues[name]) ? [...formValues[name]] : [];
    currentArray.push(defaultValue);
    
    handleChange(name, currentArray);
  };

  // Remove item from array field
  const handleRemoveArrayItem = (name, index) => {
    const currentArray = Array.isArray(formValues[name]) ? [...formValues[name]] : [];
    currentArray.splice(index, 1);
    
    handleChange(name, currentArray);
  };

  // Render a single form field
  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      required = false,
      placeholder = '',
      helperText = '',
      fullWidth = true,
      options = [],
      autoFocus = false,
      min,
      max,
      step,
      multiline = false,
      rows = 4,
      disabled: fieldDisabled = false,
      readOnly: fieldReadOnly = false,
      defaultValue,
      adornment,
      adornmentPosition = 'end',
      hidden = false,
    } = field;

    if (hidden) return null;

    const isDisabled = disabled || fieldDisabled || readOnly || fieldReadOnly;
    const value = formValues[name] !== undefined ? formValues[name] : defaultValue || '';
    const error = Boolean(errors[name]);
    const errorText = errors[name] || '';

    const commonProps = {
      id: `field-${name}`,
      name,
      value,
      label,
      required,
      placeholder,
      fullWidth,
      autoFocus,
      disabled: isDisabled,
      error,
      helperText: error ? errorText : helperText,
      sx: { mb: 2 },
    };

    // Handle input adornment
    const inputProps = {};
    if (adornment) {
      inputProps.InputProps = {
        [adornmentPosition === 'end' ? 'endAdornment' : 'startAdornment']: (
          <InputAdornment position={adornmentPosition}>
            {adornment}
          </InputAdornment>
        ),
      };
    }

    // Render different field types
    switch (type) {
      case 'select':
        return (
          <FormControl 
            fullWidth={fullWidth} 
            error={error} 
            disabled={isDisabled}
            key={name}
            sx={{ mb: 2 }}
          >
            <InputLabel id={`label-${name}`}>{label}</InputLabel>
            <Select
              labelId={`label-${name}`}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              label={label}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || helperText) && (
              <FormHelperText>{error ? errorText : helperText}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleChange(name, e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={label}
            sx={{ mb: 2 }}
          />
        );
        
      case 'switch':
        return (
          <FormControlLabel
            key={name}
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => handleChange(name, e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={label}
            sx={{ mb: 2 }}
          />
        );
        
      case 'radio':
        return (
          <FormControl 
            component="fieldset" 
            error={error}
            key={name}
            sx={{ mb: 2 }}
          >
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio disabled={isDisabled} />}
                  label={option.label}
                  disabled={isDisabled}
                />
              ))}
            </RadioGroup>
            {(error || helperText) && (
              <FormHelperText>{error ? errorText : helperText}</FormHelperText>
            )}
          </FormControl>
        );
        
      case 'autocomplete':
        return (
          <Autocomplete
            key={name}
            options={options}
            getOptionLabel={(option) => option.label}
            value={options.find(option => option.value === value) || null}
            onChange={(_, newValue) => handleChange(name, newValue ? newValue.value : null)}
            disabled={isDisabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={error}
                helperText={error ? errorText : helperText}
                required={required}
              />
            )}
            sx={{ mb: 2 }}
          />
        );
        
      case 'date':
        return (
          <DatePicker
            key={name}
            label={label}
            value={value || null}
            onChange={(newValue) => handleChange(name, newValue)}
            slotProps={{
              textField: {
                fullWidth,
                error,
                helperText: error ? errorText : helperText,
                required,
              },
            }}
            disabled={isDisabled}
            sx={{ mb: 2, width: fullWidth ? '100%' : 'auto' }}
          />
        );
        
      case 'array':
        return (
          <Box key={name} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">{label}</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => handleAddArrayItem(name, field.defaultItemValue)}
                disabled={isDisabled}
                size="small"
              >
                Add
              </Button>
            </Box>
            
            {Array.isArray(value) && value.map((item, index) => (
              <Box
                key={`${name}-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <TextField
                  value={item}
                  onChange={(e) => handleArrayItemChange(name, index, e.target.value)}
                  disabled={isDisabled}
                  fullWidth
                  size="small"
                  placeholder={placeholder}
                />
                <IconButton
                  onClick={() => handleRemoveArrayItem(name, index)}
                  disabled={isDisabled}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            {error && (
              <FormHelperText error>{errorText}</FormHelperText>
            )}
          </Box>
        );
        
      case 'number':
        return (
          <TextField
            {...commonProps}
            {...inputProps}
            key={name}
            type="number"
            inputProps={{
              min,
              max,
              step,
            }}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
        
      case 'hidden':
        return null;
        
      default: // text, password, email, etc.
        return (
          <TextField
            {...commonProps}
            {...inputProps}
            key={name}
            type={type}
            multiline={multiline}
            minRows={multiline ? rows : undefined}
            onChange={(e) => handleChange(name, e.target.value)}
          />
        );
    }
  };

  // If sections are provided, render fields by section
  if (sections && sections.length > 0) {
    return (
      <Box sx={sx}>
        {sections.map((section, index) => (
          <Box key={`section-${index}`} sx={{ mb: 4 }}>
            {section.title && (
              <>
                <Typography variant="h6" gutterBottom>
                  {section.title}
                </Typography>
                {section.description && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {section.description}
                  </Typography>
                )}
                <Divider sx={{ mb: 2 }} />
              </>
            )}
            
            <Grid container spacing={2}>
              {section.fields.map((field) => (
                <Grid 
                  item 
                  key={field.name} 
                  xs={12} 
                  sm={field.width || 12}
                >
                  {renderField(field)}
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  }

  // Otherwise, render all fields
  return (
    <Box sx={sx}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid 
            item 
            key={field.name} 
            xs={12} 
            sm={field.width || 12}
          >
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FormBuilder;