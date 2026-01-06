import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
          <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)


{/* Open Chats - Hiển thị từ phải sang trái */}
{/* <div className="fixed bottom-4 right-4 flex flex-row-reverse gap-3 z-50">
  {openChats.map(chat => (
      chat.isGroup ? (
          <GroupChatBox
              key={`group-${chat.id}`}
              group={chat}
              closeChat={closeChat}
              user={profile}
          />
      ) : (
          <ChatBox
              key={`private-${chat.id}`}
              closeChat={closeChat}
              user={profile}
              friend={chat}
              startCall={receiverId => audioCallRef.current?.startCall(receiverId)}
              videoCall={receiverId => videoCallRef.current?.startCall(receiverId)}
          />
      )
  ))}
</div> */}