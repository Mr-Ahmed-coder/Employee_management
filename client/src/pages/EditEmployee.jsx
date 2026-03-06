import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FiEdit2,
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

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await axios.get(`/employees/${id}`);
                const emp = res.data.data;
                setFormData({
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    street: emp.address?.street || '',
                    city: emp.address?.city || '',
                    state: emp.address?.state || '',
                    zipCode: emp.address?.zipCode || '',
                    country: emp.address?.country || '',
                    designation: emp.designation || '',
                    department: emp.department || '',
                    joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
                    salary: emp.salary || '',
                    status: emp.status || 'Active',
                });
            } catch (error) {
                toast.error('Failed to load employee data');
                navigate('/employees');
            } finally {
                setFetching(false);
            }
        };
        fetchEmployee();
    }, [id, navigate]);

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

            await axios.put(`/employees/${id}`, payload);
            toast.success('Employee updated successfully!');
            navigate(`/employees/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update employee');
        } finally {
            setIsLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading employee data...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn btn-back" onClick={() => navigate(`/employees/${id}`)}>
                    <FiArrowLeft /> Back to Employee
                </button>
                <h1>
                    <FiEdit2 /> Edit Employee
                </h1>
                <p>Update employee information</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiUser /> Personal Information
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name *</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name *</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-email"><FiMail /> Email *</label>
                                <input type="email" id="edit-email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-phone"><FiPhone /> Phone *</label>
                                <input type="text" id="edit-phone" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiMapPin /> Address
                        </h3>
                        <div className="form-group">
                            <label htmlFor="edit-street">Street</label>
                            <input type="text" id="edit-street" name="street" value={formData.street} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-city">City</label>
                                <input type="text" id="edit-city" name="city" value={formData.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-state">State</label>
                                <input type="text" id="edit-state" name="state" value={formData.state} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-zip">Zip Code</label>
                                <input type="text" id="edit-zip" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-country">Country</label>
                                <input type="text" id="edit-country" name="country" value={formData.country} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">
                            <FiBriefcase /> Job Information
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-designation">Designation *</label>
                                <input type="text" id="edit-designation" name="designation" value={formData.designation} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-department">Department *</label>
                                <input type="text" id="edit-department" name="department" value={formData.department} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="edit-joining"><FiCalendar /> Joining Date *</label>
                                <input type="date" id="edit-joining" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-salary"><FiDollarSign /> Salary *</label>
                                <input type="number" id="edit-salary" name="salary" value={formData.salary} onChange={handleChange} min="0" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-status">Status</label>
                            <select id="edit-status" name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                        {isLoading ? (
                            <span className="btn-loading"><span className="spinner-small"></span> Updating...</span>
                        ) : (
                            <><FiSave /> Update Employee</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditEmployee;
