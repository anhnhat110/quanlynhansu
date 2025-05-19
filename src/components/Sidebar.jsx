import { Menu } from 'antd';
import { 
  TeamOutlined,
  CalendarOutlined,
  PieChartOutlined,
  UserSwitchOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/images.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy key từ pathname, ví dụ: "/chuyen-gia" -> "chuyen-gia"
  const selectedKey = location.pathname.split('/')[1] || '';

  return (
    <div style={{ 
      width: 250, 
      height: '100vh', 
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <img 
          src={logo}
          alt="DUE Logo" 
          onClick={() => navigate("/")} 
          style={{ width: 40, height: 40, cursor: 'pointer' }}
        />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1890ff' }}>ĐẠI HỌC ĐÀ NẴNG</div>
          <div style={{ fontSize: '12px', color: '#1890ff' }}>TRƯỜNG ĐẠI HỌC KINH TẾ</div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]} // <-- thay vì defaultSelectedKeys
        style={{ borderRight: 0 }}
        onClick={({ key }) => {
          navigate(`/${key}`);
        }}
        items={[
          {
            key: 'chuyen-gia',
            icon: <TeamOutlined />,
            label: 'Quản lý chuyên gia'
          },
          {
            key: 'su-kien',
            icon: <CalendarOutlined />,
            label: 'Quản lý sự kiện '
          },
          {
            key: 'sinh-vien',
            icon: <UserSwitchOutlined />,
            label: 'Quản lý sinh viên trao đổi'
          },
          {
            key: 'danh-muc-doan',
            icon: <AuditOutlined />,
            label: 'Quản lý danh mục đoàn'
          },
          {
            key: 'bieu-do',
            icon: <PieChartOutlined />,
            label: 'Quản lý dashboard',
            children: [
              {
                key: 'bieu-do',
                label: 'Biểu đồ'
              },
              {
                key: 'export',
                label: 'Xuất dữ liệu'
              }
            ]
          }
        ]}
      />
    </div>
  );
}
