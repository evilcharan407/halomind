
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const iconMapping = {
    HomeIcon: 'home',
    SettingsIcon: 'settings',
    BackIcon: 'arrow-back',
    BookIcon: 'book',
    ArrowRightIcon: 'arrow-forward',
    PlusIcon: 'add',
    NotesIcon: 'notes',
    ExplainerIcon: 'lightbulb-outline',
    QuizIcon: 'quiz',
    FlashcardsIcon: 'style',
    LightningIcon: 'flash-on',
    MicrophoneIcon: 'mic',
    StopIcon: 'stop',
    ChatBubbleIcon: 'chat-bubble-outline',
    ImageIcon: 'image',
    VideoIcon: 'videocam',
    SendIcon: 'send',
    UploadIcon: 'file-upload',
    LinkIcon: 'link',
    CameraIcon: 'camera-alt',
    ActivityIcon: 'timeline',
    FlameIcon: 'whatshot',
    TrophyIcon: 'emoji-events',
    CheckCircleIcon: 'check-circle',
    XCircleIcon: 'cancel',
    CalendarIcon: 'calendar-today',
    ExportIcon: 'save-alt',
    TrashIcon: 'delete',
    GoogleDriveIcon: 'add-to-drive',
    VoiceAssistantIcon: 'record-voice-over',
    MagicIcon: 'auto-awesome',
    DragHandleIcon: 'drag-handle',
};

type IconName = keyof typeof iconMapping;

const Icon = ({ name, size = 24, color = '#000' }: { name: IconName, size?: number, color?: string }) => (
    <MaterialIcons name={iconMapping[name]} size={size} color={color} />
);

export default Icon;

export const HomeIcon = (props: { size?: number, color?: string }) => <Icon name="HomeIcon" {...props} />;
export const SettingsIcon = (props: { size?: number, color?: string }) => <Icon name="SettingsIcon" {...props} />;
export const BackIcon = (props: { size?: number, color?: string }) => <Icon name="BackIcon" {...props} />;
export const BookIcon = (props: { size?: number, color?: string }) => <Icon name="BookIcon" {...props} />;
export const ArrowRightIcon = (props: { size?: number, color?: string }) => <Icon name="ArrowRightIcon" {...props} />;
export const PlusIcon = (props: { size?: number, color?: string }) => <Icon name="PlusIcon" {...props} />;
export const NotesIcon = (props: { size?: number, color?: string }) => <Icon name="NotesIcon" {...props} />;
export const ExplainerIcon = (props: { size?: number, color?: string }) => <Icon name="ExplainerIcon" {...props} />;
export const QuizIcon = (props: { size?: number, color?: string }) => <Icon name="QuizIcon" {...props} />;
export const FlashcardsIcon = (props: { size?: number, color?: string }) => <Icon name="FlashcardsIcon" {...props} />;
export const LightningIcon = (props: { size?: number, color?: string }) => <Icon name="LightningIcon" {...props} />;
export const MicrophoneIcon = (props: { size?: number, color?: string }) => <Icon name="MicrophoneIcon" {...props} />;
export const StopIcon = (props: { size?: number, color?: string }) => <Icon name="StopIcon" {...props} />;
export const ChatBubbleIcon = (props: { size?: number, color?: string }) => <Icon name="ChatBubbleIcon" {...props} />;
export const ImageIcon = (props: { size?: number, color?: string }) => <Icon name="ImageIcon" {...props} />;
export const VideoIcon = (props: { size?: number, color?: string }) => <Icon name="VideoIcon" {...props} />;
export const SendIcon = (props: { size?: number, color?: string }) => <Icon name="SendIcon" {...props} />;
export const UploadIcon = (props: { size?: number, color?: string }) => <Icon name="UploadIcon" {...props} />;
export const LinkIcon = (props: { size?: number, color?: string }) => <Icon name="LinkIcon" {...props} />;
export const CameraIcon = (props: { size?: number, color?: string }) => <Icon name="CameraIcon" {...props} />;
export const ActivityIcon = (props: { size?: number, color?: string }) => <Icon name="ActivityIcon" {...props} />;
export const FlameIcon = (props: { size?: number, color?: string }) => <Icon name="FlameIcon" {...props} />;
export const TrophyIcon = (props: { size?: number, color?: string }) => <Icon name="TrophyIcon" {...props} />;
export const CheckCircleIcon = (props: { size?: number, color?: string }) => <Icon name="CheckCircleIcon" {...props} />;
export const XCircleIcon = (props: { size?: number, color?: string }) => <Icon name="XCircleIcon" {...props} />;
export const CalendarIcon = (props: { size?: number, color?: string }) => <Icon name="CalendarIcon" {...props} />;
export const ExportIcon = (props: { size?: number, color?: string }) => <Icon name="ExportIcon" {...props} />;
export const TrashIcon = (props: { size?: number, color?: string }) => <Icon name="TrashIcon" {...props} />;
export const GoogleDriveIcon = (props: { size?: number, color?: string }) => <Icon name="GoogleDriveIcon" {...props} />;
export const VoiceAssistantIcon = (props: { size?: number, color?: a }) => <Icon name="VoiceAssistantIcon" {...props} />;
export const MagicIcon = (props: { size?: number, color?: string }) => <Icon name="MagicIcon" {...props} />;
export const DragHandleIcon = (props: { size?: number, color?: string }) => <Icon name="DragHandleIcon" {...props} />;
