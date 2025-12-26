import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { v4 as uuidv4 } from "uuid";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

export default function Profile() {
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState<string | null>(null); // Track edit

  const uid = auth.currentUser?.uid;

  // Fetch user data
  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setName(snap.data().name);
        setContacts(snap.data().contacts || []);
      }
    };
    fetchUser();
  }, [uid]);

  // Phone validation
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

  // Add or update contact
  const saveContact = async () => {
    if (!uid || !newContact.name || !newContact.phone) return alert("Fill all fields");
    if (!isValidPhone(newContact.phone)) return alert("Phone number must be 10 digits");

    const docRef = doc(db, "users", uid);

    if (editingId) {
      // Edit existing
      const contactIndex = contacts.findIndex(c => c.id === editingId);
      if (contactIndex === -1) return;

      const updatedContact = { id: editingId, ...newContact };

      // Remove old contact and add updated one
      await updateDoc(docRef, {
        contacts: arrayRemove(contacts[contactIndex])
      });
      await updateDoc(docRef, {
        contacts: arrayUnion(updatedContact)
      });

      setContacts(contacts.map(c => (c.id === editingId ? updatedContact : c)));
      setEditingId(null);
    } else {
      // Add new
      const contact = { id: uuidv4(), ...newContact };
      await updateDoc(docRef, { contacts: arrayUnion(contact) });
      setContacts([...contacts, contact]);
    }

    setNewContact({ name: "", phone: "" });
  };

  // Edit contact button
  const editContact = (contact: Contact) => {
    setNewContact({ name: contact.name, phone: contact.phone });
    setEditingId(contact.id);
  };

  // Remove contact
  const removeContact = async (id: string) => {
    if (!uid) return;
    const docRef = doc(db, "users", uid);
    const contactToRemove = contacts.find(c => c.id === id);
    if (!contactToRemove) return;
    await updateDoc(docRef, { contacts: arrayRemove(contactToRemove) });
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="mb-4">Name: {name}</p>

      <h2 className="text-xl font-semibold mb-2">Contacts</h2>
      <ul className="mb-4">
        {contacts.map(c => (
          <li key={c.id} className="flex justify-between items-center mb-1">
            <span>{c.name} - {c.phone}</span>
            <div className="flex gap-2">
              <button
                onClick={() => editContact(c)}
                className="text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => removeContact(c.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={newContact.name}
          onChange={e => setNewContact({ ...newContact, name: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Phone (10 digits)"
          value={newContact.phone}
          onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={saveContact}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {editingId ? "Update Contact" : "Add Contact"}
        </button>
      </div>
    </div>
  );
}
