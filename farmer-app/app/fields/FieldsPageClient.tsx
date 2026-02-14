'use client';

import React, { useState } from 'react';
import { Field } from '@/lib/types';
import MapComponent from '@/components/Map';

interface FieldsPageClientProps {
    fields: Field[];
}

export default function FieldsPageClient({ fields }: FieldsPageClientProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [newFieldCoords, setNewFieldCoords] = useState<number[][] | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newFieldDetails, setNewFieldDetails] = useState({
        name: '',
        crop: 'Soybeans',
        status: 'Healthy',
    });

    const [localFields, setLocalFields] = useState<Field[]>(fields);
    const [isListOpen, setIsListOpen] = useState(true);
    const [selectedFieldId, setSelectedFieldId] = useState<string>('');

    const toggleList = () => setIsListOpen(!isListOpen);

    const handleFieldSelect = (id: string) => {
        setSelectedFieldId(id);
        if (window.innerWidth < 768 && id) {
            setIsListOpen(false); // Close list on mobile when field selected
        }
    };

    const handleDrawStart = () => {
        setIsDrawing(true);
        setIsListOpen(false); // Close list to give space for drawing
        setSelectedFieldId('');
    };

    const handleDrawEnd = (coords: number[][]) => {
        setIsDrawing(false);
        setNewFieldCoords(coords);
        setIsAddModalOpen(true);
    };

    const handleSaveField = (e: React.FormEvent) => {
        e.preventDefault();
        const newField: Field = {
            id: `f${Date.now()}`,
            name: newFieldDetails.name || 'New Field',
            crop: newFieldDetails.crop,
            acres: Math.round(Math.random() * 50 + 10), // Mock acres calculation
            status: newFieldDetails.status as any,
            growthStage: 'Seedling',
            maturityPercentage: 10,
            lastIrrigated: new Date().toISOString(),
            moisturePercentage: 45,
            coordinates: newFieldCoords || [],
            imageUrl: '',
        };

        setLocalFields([...localFields, newField]);
        setIsAddModalOpen(false);
        setNewFieldDetails({ name: '', crop: 'Soybeans', status: 'Healthy' });
        setNewFieldCoords(null);
        setSelectedFieldId(newField.id);
        setIsListOpen(true);
    };

    const handleDeleteField = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this field?')) {
            setLocalFields(localFields.filter(f => f.id !== id));
            if (selectedFieldId === id) {
                setSelectedFieldId('');
            }
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen md:overflow-hidden relative bg-gray-200">
            {/* Mobile Header */}
            <header className="md:hidden absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent pt-4 pb-12 px-4 pointer-events-none transition-opacity duration-300">
                <div className="flex items-center justify-between text-white pointer-events-auto">
                    <button
                        onClick={() => setIsListOpen(!isListOpen)}
                        className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors shadow-lg active:scale-95 transform"
                    >
                        <span className="material-icons text-xl">{isListOpen ? 'map' : 'list'}</span>
                    </button>
                    <h1 className="text-base font-semibold tracking-wide shadow-black drop-shadow-md">Field Overview</h1>
                    <button
                        onClick={handleDrawStart}
                        className={`p-2.5 rounded-xl transition-colors shadow-lg active:scale-95 transform ${isDrawing ? 'bg-primary text-white' : 'bg-white/20 backdrop-blur-md hover:bg-white/30'}`}
                    >
                        <span className="material-icons text-xl">{isDrawing ? 'edit_off' : 'edit'}</span>
                    </button>
                </div>
            </header>

            {/* List Section */}
            <section
                className={`fixed inset-x-0 bottom-0 top-20 md:static md:w-80 lg:w-96 bg-background-light dark:bg-background-dark md:border-r border-gray-100 dark:border-gray-800 z-30 transition-transform duration-300 ease-in-out transform ${isListOpen ? 'translate-y-0' : 'translate-y-[110%] md:translate-y-0'
                    } md:transform-none flex flex-col rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none overflow-hidden`}
            >
                <div className="pt-4 pb-3 px-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 md:hidden opacity-50"></div>
                    <div className="flex justify-between items-center mb-1">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Fields</h2>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">{localFields.length} active plots</p>
                        </div>
                        <button
                            onClick={handleDrawStart}
                            className={`text-xs font-semibold hover:bg-primary/90 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-1 ${isDrawing ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}
                        >
                            <span className="material-icons text-sm">{isDrawing ? 'close' : 'add'}</span>
                            {isDrawing ? 'Cancel' : 'Draw Field'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8 md:pb-4 no-scrollbar bg-gray-50 dark:bg-black/20">
                    {localFields.map((field) => (
                        <div
                            key={field.id}
                            onClick={() => handleFieldSelect(field.id)}
                            className={`rounded-2xl p-4 border transition-all cursor-pointer relative group ${selectedFieldId === field.id
                                ? 'bg-white dark:bg-gray-900 border-primary ring-1 ring-primary shadow-lg scale-[1.02]'
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${field.crop === 'Soybeans' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'
                                        }`}>
                                        <span className="material-icons text-xl">agriculture</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{field.name}</h3>
                                        <p className="text-[11px] font-medium text-gray-500">{field.crop} · {field.acres} Acres</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${field.status === 'Healthy'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                        }`}>{field.status}</span>
                                    <button
                                        onClick={(e) => handleDeleteField(e, field.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete Field"
                                    >
                                        <span className="material-icons text-lg">delete_outline</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Growth</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{field.growthStage}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Moisture</span>
                                    <span className={`text-xs font-bold flex items-center gap-1 ${field.moisturePercentage < 10 ? 'text-amber-600' : 'text-blue-600'
                                        }`}>
                                        <span className="material-icons text-[12px]">water_drop</span> {field.moisturePercentage}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200 dark:border-gray-800">
                                <span className="text-[10px] font-medium text-gray-400">Last: {new Date(field.lastIrrigated).toLocaleDateString()}</span>
                                <span className={`material-icons text-gray-300 group-hover:text-primary transition-colors text-lg ${selectedFieldId === field.id ? 'text-primary' : ''}`}>
                                    chevron_right
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Map Section */}
            <section className="flex-1 relative h-full md:h-full z-0">
                <MapComponent
                    fields={localFields}
                    selectedFieldId={selectedFieldId}
                    onFieldSelect={(id) => {
                        setSelectedFieldId(id);
                        if (id && window.innerWidth < 768) setIsListOpen(false); // Mobile UX
                    }}
                    isDrawing={isDrawing}
                    onDrawEnd={handleDrawEnd}
                />

                {/* Floating Controls */}
                <div className="absolute top-24 md:top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 pointer-events-none z-10 max-w-[160px]">
                    <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-wider">Legend</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm ring-2 ring-green-100"></span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Healthy</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm ring-2 ring-amber-100"></span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Attention</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100"></span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Critical</span>
                        </div>
                    </div>
                </div>

            </section>

            {/* Add Field Modal - Moved outside Map Section to fix z-index stacking */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Save New Field</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveField} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Field Name</label>
                                <input
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. North Plot"
                                    value={newFieldDetails.name}
                                    onChange={e => setNewFieldDetails({ ...newFieldDetails, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crop Type</label>
                                <select
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    value={newFieldDetails.crop}
                                    onChange={e => setNewFieldDetails({ ...newFieldDetails, crop: e.target.value })}
                                >
                                    <option>Soybeans</option>
                                    <option>Corn</option>
                                    <option>Wheat</option>
                                    <option>Rice</option>
                                    <option>Cotton</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Status</label>
                                <select
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    value={newFieldDetails.status}
                                    onChange={e => setNewFieldDetails({ ...newFieldDetails, status: e.target.value })}
                                >
                                    <option value="Healthy">Healthy</option>
                                    <option value="Dry">Dry</option>
                                    <option value="Needs Attention">Needs Attention</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2"
                            >
                                Save Field
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
