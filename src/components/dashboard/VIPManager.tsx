'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Plus, Edit, Trash2, Crown, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Email, SlackMessage } from '@/types';

interface VIPContact {
  id: string;
  email: string;
  name: string;
  importance: number;
  relationship: 'direct_report' | 'manager' | 'peer' | 'external' | 'board' | 'investor' | 'client';
  department?: string;
  notes?: string;
  lastContact?: Date;
  responseTime?: number; // Average response time in hours
  interactionScore?: number;
  avatar?: string;
}

interface VIPManagerProps {
  emails: Email[];
  messages: SlackMessage[];
  onVIPUpdate: (contacts: VIPContact[]) => void;
  className?: string;
}

export default function VIPManager({ emails, messages, onVIPUpdate, className = '' }: VIPManagerProps) {
  const [vipContacts, setVipContacts] = useState<VIPContact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<VIPContact | null>(null);
  const [detectedVIPs, setDetectedVIPs] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    importance: 80,
    relationship: 'peer' as VIPContact['relationship'],
    department: '',
    notes: ''
  });

  useEffect(() => {
    loadVIPContacts();
    detectPotentialVIPs();
  }, [emails, messages]);

  const loadVIPContacts = () => {
    const stored = localStorage.getItem('vipContacts');
    if (stored) {
      const contacts = JSON.parse(stored);
      setVipContacts(contacts);
      onVIPUpdate(contacts);
    }
  };

  const saveVIPContacts = (contacts: VIPContact[]) => {
    localStorage.setItem('vipContacts', JSON.stringify(contacts));
    setVipContacts(contacts);
    onVIPUpdate(contacts);
  };

  const detectPotentialVIPs = () => {
    const allContacts = new Set<string>();
    
    // Extract email contacts
    emails.forEach(email => {
      if (email.from) allContacts.add(email.from);
    });
    
    // Extract Slack contacts
    messages.forEach(message => {
      if (message.user) allContacts.add(message.user);
    });

    // Filter for potential VIPs based on patterns
    const potentialVIPs = Array.from(allContacts).filter(contact => {
      const lower = contact.toLowerCase();
      return lower.includes('ceo') || 
             lower.includes('founder') || 
             lower.includes('president') ||
             lower.includes('director') ||
             lower.includes('head') ||
             lower.includes('lead') ||
             lower.includes('manager') ||
             lower.includes('board') ||
             lower.includes('investor');
    });

    setDetectedVIPs(potentialVIPs);
  };

  const addVIPContact = () => {
    const newContact: VIPContact = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      importance: formData.importance,
      relationship: formData.relationship,
      department: formData.department,
      notes: formData.notes,
      lastContact: new Date(),
      responseTime: 0,
      interactionScore: 0
    };

    const updatedContacts = [...vipContacts, newContact];
    saveVIPContacts(updatedContacts);
    resetForm();
    setIsDialogOpen(false);
  };

  const updateVIPContact = () => {
    if (!editingContact) return;

    const updatedContacts = vipContacts.map(contact => 
      contact.id === editingContact.id 
        ? { ...contact, ...formData }
        : contact
    );

    saveVIPContacts(updatedContacts);
    resetForm();
    setEditingContact(null);
    setIsDialogOpen(false);
  };

  const deleteVIPContact = (id: string) => {
    const updatedContacts = vipContacts.filter(contact => contact.id !== id);
    saveVIPContacts(updatedContacts);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      importance: 80,
      relationship: 'peer',
      department: '',
      notes: ''
    });
  };

  const editContact = (contact: VIPContact) => {
    setEditingContact(contact);
    setFormData({
      email: contact.email,
      name: contact.name,
      importance: contact.importance,
      relationship: contact.relationship,
      department: contact.department || '',
      notes: contact.notes || ''
    });
    setIsDialogOpen(true);
  };

  const addDetectedVIP = (contact: string) => {
    const name = contact.split('@')[0] || contact;
    setFormData({
      email: contact,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      importance: 75,
      relationship: 'external',
      department: '',
      notes: 'Auto-detected VIP'
    });
    setIsDialogOpen(true);
  };

  const getRelationshipIcon = (relationship: VIPContact['relationship']) => {
    switch (relationship) {
      case 'board': return <Crown className="w-4 h-4" />;
      case 'investor': return <TrendingUp className="w-4 h-4" />;
      case 'manager': return <Users className="w-4 h-4" />;
      case 'direct_report': return <Users className="w-4 h-4" />;
      case 'client': return <Star className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 90) return 'bg-red-100 text-red-800';
    if (importance >= 80) return 'bg-orange-100 text-orange-800';
    if (importance >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const sortedContacts = [...vipContacts].sort((a, b) => b.importance - a.importance);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* VIP Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            VIP Contact Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-burgundy">{vipContacts.length}</div>
              <div className="text-sm text-gray-600">VIP Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {vipContacts.filter(c => c.importance >= 90).length}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {vipContacts.filter(c => c.importance >= 80 && c.importance < 90).length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingContact(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add VIP Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Edit VIP Contact' : 'Add VIP Contact'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Importance (1-100)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.importance}
                    onChange={(e) => setFormData({...formData, importance: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Relationship</label>
                  <Select value={formData.relationship} onValueChange={(value) => setFormData({...formData, relationship: value as VIPContact['relationship']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">Board Member</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="direct_report">Direct Report</SelectItem>
                      <SelectItem value="peer">Peer</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Engineering, Sales, Marketing..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes..."
                  />
                </div>
                <Button 
                  onClick={editingContact ? updateVIPContact : addVIPContact}
                  className="w-full"
                >
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* VIP Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>VIP Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-burgundy rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-600">{contact.email}</div>
                    {contact.department && (
                      <div className="text-xs text-gray-500">{contact.department}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getImportanceColor(contact.importance)} flex items-center gap-1`}>
                    {getRelationshipIcon(contact.relationship)}
                    {contact.importance}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => editContact(contact)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteVIPContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detected VIPs */}
      {detectedVIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Detected VIP Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="body2" className="text-gray-600 mb-4">
              These contacts may be VIPs based on their email patterns. Review and add them to your VIP list.
            </Typography>
            <div className="space-y-2">
              {detectedVIPs.slice(0, 5).map(contact => (
                <div key={contact} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">{contact}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDetectedVIP(contact)}
                  >
                    Add as VIP
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}