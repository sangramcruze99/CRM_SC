'use client';

import React, { useState, useEffect } from 'react';
import { SchemaDefinition, FieldDefinition } from './SchemaBuilder';

interface DynamicFormProps {
  schema: SchemaDefinition;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function DynamicForm({ schema, initialData, onSubmit, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // For relation fields, we need to fetch the target object's records to show in a dropdown
  const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchRelations = async () => {
      const newRelationOptions: Record<string, any[]> = {};
      
      for (const field of schema.fields) {
        if (field.fieldType === 'RELATION' && field.options?.targetObjectId) {
          try {
            const res = await fetch(`/api/custom-objects/${field.options.targetObjectId}/records`);
            if (res.ok) {
              const records = await res.json();
              newRelationOptions[field.apiName] = records;
            }
          } catch (e) {
            console.error(`Failed to fetch records for relation field ${field.name}`, e);
          }
        }
      }
      setRelationOptions(newRelationOptions);
    };

    fetchRelations();
  }, [schema]);

  const handleChange = (fieldApiName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldApiName]: value }));
    // Clear error for this field when changed
    if (errors[fieldApiName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldApiName];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      if (field.isRequired && !formData[field.apiName] && formData[field.apiName] !== false && formData[field.apiName] !== 0) {
        newErrors[field.apiName] = `${field.name} is required`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field: FieldDefinition) => {
    const value = formData[field.apiName] || '';
    const hasError = !!errors[field.apiName];
    const inputClass = `w-full px-3 py-2 border rounded-xl focus:outline-none focus:bg-white/[0.08] bg-white/[0.05] text-white text-xs ${hasError ? 'border-rose-500' : 'border-white/[0.1]'}`;

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input type="text" className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
      case 'NUMBER':
        return (
          <input type="number" className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value === '' ? '' : Number(e.target.value))}
          />
        );
      case 'DATE':
        return (
          <input type="date" className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
          />
        );
      case 'BOOLEAN':
        return (
          <div className="flex items-center h-10">
            <input
              id={field.apiName}
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.apiName, e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
          </div>
        );
      case 'SELECT':
        return (
          <select 
            id={field.apiName}
            value={value} 
            onChange={(e) => handleChange(field.apiName, e.target.value)}
            className={inputClass}
          >
            <option value="" disabled className="bg-slate-900 text-white">Select {field.name}</option>
            {(field.options?.choices || []).map((choice: string) => (
              <option key={choice} value={choice} className="bg-slate-900 text-white">{choice}</option>
            ))}
          </select>
        );
      case 'RELATION':
        const records = relationOptions[field.apiName] || [];
        return (
          <select 
            id={field.apiName}
            value={value} 
            onChange={(e) => handleChange(field.apiName, e.target.value)}
            className={inputClass}
          >
            <option value="" disabled className="bg-slate-900 text-white">Select {field.name}</option>
            {records.map((rec) => (
              <option key={rec.id} value={rec.id} className="bg-slate-900 text-white">
                {rec.data?.name || rec.data?.title || rec.id}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input type="text" className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.04] backdrop-blur-2xl p-6 rounded-3xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{initialData ? `Edit ${schema.name}` : `New ${schema.name}`}</h2>
        {schema.description && <p className="text-xs text-slate-400 mt-1">{schema.description}</p>}
      </div>

      <div className="space-y-4">
        {schema.fields.map((field) => (
          <div key={field.apiName} className="space-y-1.5">
            <label htmlFor={field.apiName} className="text-xs font-semibold text-slate-300 block">
              {field.name} {field.isRequired && <span className="text-rose-400">*</span>}
            </label>
            {renderFieldInput(field)}
            {errors[field.apiName] && (
              <p className="text-xs text-rose-400">{errors[field.apiName]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
        {onCancel && (
          <button type="button" className="px-4 py-2 border border-white/[0.1] rounded-xl text-slate-300 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold transition-colors cursor-pointer" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
