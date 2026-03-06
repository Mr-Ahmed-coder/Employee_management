import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiUserPlus,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiCalendar,
    FiDollarSign,
    FiSave,
    FiArrowLeft,
} from 'react-icons/fi';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        designation: '',
        department: '',
        joiningDate: '',
        salary: '',
        status: 'Active',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
                designation: formData.designation,
                department: formData.department,
                joiningDate: formData.joiningDate,
                salary: Number(formData.salary),
                status: formData.status,
            };

            await axios.post('/employees', payload);
            toast.success('Employee created successfully!');
            navigate('/employees');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-back" onClick={() => navigate('/employees')}>
                    <FiArrowLeft /> Back to Employees
                </button>
                <h1>
                    <FiUserPlus /> Add New Employee
                </h1>
                <p>Fill in the details to create a new employee record</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiUser /> Personal Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="emp-email">
                                    <FiMail /> Email *
                                </label>
                                <input
                                    type="email"
                                    id="emp-email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">
                                    <FiPhone /> Phone *
                                </label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiMapPin /> Address
                        </h3>

                        <div className="form-group">
                            <label htmlFor="street">Street</label>
                            <input
                                type="text"
                                id="street"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="Enter street address"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Enter city"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="state">State</label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Enter state"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="zipCode">Zip Code</label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    placeholder="Enter zip code"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Job Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiBriefcase /> Job Information
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="designation">Designation *</label>
                                <input
                                    type="text"
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineer"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="department">Department *</label>
                                <input
                                    type="text"
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Engineering"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="joiningDate">
                                    <FiCalendar /> Joining Date *
                                </label>
                                <input
                                    type="date"
                                    id="joiningDate"
                                    name="joiningDate"
                                    value={formData.joiningDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="salary">
                                    <FiDollarSign /> Salary *
                                </label>
                                <input
                                    type="number"
                                    id="salary"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="Enter salary"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="btn-loading">
                                <span className="spinner-small"></span> Creating...
                            </span>
                        ) : (
                            <>
                                <FiSave /> Create Employee
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;
