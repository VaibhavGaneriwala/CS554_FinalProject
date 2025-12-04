import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Welcome, {user?.firstName} {user?.lastName}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        {user?.age && <p><strong>Age:</strong> {user.age}</p>}
        {user?.height && <p><strong>Height:</strong> {user.height} cm</p>}
        {user?.weight && <p><strong>Weight:</strong> {user.weight} kg</p>}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>🏋️ Workouts</h3>
          <p>Track your exercises and routines</p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f3e5f5', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>🍽️ Meals</h3>
          <p>Log your nutrition and calories</p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e8f5e9', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>📈 Progress</h3>
          <p>Monitor your fitness journey</p>
        </div>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3e0', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>📱 Social Feed</h3>
          <p>Connect with other users</p>
        </div>
      </div>

      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <h3>Getting Started</h3>
        <p>This is your fitness tracking dashboard. Here you can:</p>
        <ul>
          <li>Log your workouts and track exercises</li>
          <li>Record meals and monitor nutrition</li>
          <li>Track your progress with weight, PRs, and photos</li>
          <li>Share your fitness journey with others</li>
          <li>View and interact with other users' posts</li>
        </ul>
        <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
          More features coming soon...
        </p>
      </div>
    </div>
  );
};

export default Dashboard;