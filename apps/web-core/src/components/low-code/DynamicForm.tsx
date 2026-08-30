'use client';

import React, { useState, useEffect } from 'react';
import { SchemaDefinition, FieldDefinition } from './SchemaBuilder';
import { Save, X, AlertCircle } from 'lucide-react';

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
    const inputClass = `w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-white/70 dark:bg-white/[0.05] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 ${
      hasError ? 'border-rose-500 ring-1 ring-rose-500/30' : 'border-slate-200 dark:border-white/[0.1]'
    }`;

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}`}
          />
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            className={`${inputClass} font-mono`}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
          />
        );
      case 'BOOLEAN':
        return (
          <div className="flex items-center h-9">
            <input
              id={field.apiName}
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(field.apiName, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 accent-amber-500 focus:ring-amber-400 cursor-pointer"
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
            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Select {field.name}
            </option>
            {(field.options?.choices || []).map((choice: string) => (
              <option key={choice} value={choice} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {choice}
              </option>
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
            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Select {field.name}
            </option>
            {records.map((rec) => (
              <option key={rec.id} value={rec.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {rec.data?.name || rec.data?.title || rec.id}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            className={inputClass}
            id={field.apiName}
            value={value}
            onChange={(e) => handleChange(field.apiName, e.target.value)}
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 luxe-box p-6 rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl text-slate-900 dark:text-white"
    >
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-3">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          {initialData ? `Edit ${schema.name}` : `New ${schema.name}`}
        </h2>
        {schema.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{schema.description}</p>
        )}
      </div>

      <div className="space-y-3.5">
        {schema.fields.map((field) => (
          <div key={field.apiName} className="space-y-1">
            <label
              htmlFor={field.apiName}
              className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider"
            >
              {field.name} {field.isRequired && <span className="text-rose-500">*</span>}
            </label>
            {renderFieldInput(field)}
            {errors[field.apiName] && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 font-semibold mt-0.5">
                <AlertCircle size={11} />
                <span>{errors[field.apiName]}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 border border-slate-200 dark:border-white/[0.1] rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold transition-colors cursor-pointer"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          disabled={isSubmitting}
        >
          <Save size={13} />
          <span>{isSubmitting ? 'Saving...' : 'Save Record'}</span>
        </button>
      </div>
    </form>
  );
}
