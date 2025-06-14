"use client";

import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {toast } from "sonner";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender:string;
  washCount:number;
  loyaltyPoints:number;
}


const mockUserPreferences = {
  id: "68346b9607c460c135fcf474",
  detergentType: "SCENTED",
  fabricSoftener: true,
  oxiclean: false,
  starchLevel: "NONE",
  dryingMethod: "AIR_DRY",
  ironingLevel: "NONE",
  specialNotes: "Handle with care, allergic to strong fragrances",
  userId: "677be1e399fa0e2672d8df2a",
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
 const [users,setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 10;

  useEffect(() => {
  const fetchUsers = async ()=>{
    try{
      setLoading(true);
      const response = await fetch("https://washamlaundryapi.onrender.com/v1/users",{
        method:"GET",
        headers:{
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        }
      })
      if(!response.ok){
        toast("failed to fetch users")
        throw new Error("failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
      toast("users fetched successfully");
      console.log("Fetched users:", data);

    }
    catch(error){
      console.log("Error fetching users:", error);
    }
    finally{
      setLoading(false);
    }
  };
 fetchUsers();
},[setUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm)
  );
  
  // Paginate users
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

 

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openPreferencesDialog = (user: User) => {
    setSelectedUser(user);
    setPreferencesDialogOpen(true);
  };




  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex mb-20 mt-10 flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage your users and their preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full md:w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Add User</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Wash Count</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell className="capitalize">{user.gender}</TableCell>
                    <TableCell>{user.washCount}</TableCell>
                    <TableCell>{user.loyaltyPoints}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => console.log("Edit user", user.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openPreferencesDialog(user)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            User Preferences
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstUser + 1} to{" "}
              {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Preferences Dialog */}
      <Dialog
        open={preferencesDialogOpen}
        onOpenChange={setPreferencesDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Preferences</DialogTitle>
            <DialogDescription>
              Preferences for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Detergent Type</p>
                <p className="text-sm">{mockUserPreferences.detergentType}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Fabric Softener</p>
                <Badge
                  variant={
                    mockUserPreferences.fabricSoftener ? "default" : "outline"
                  }
                >
                  {mockUserPreferences.fabricSoftener ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">OxiClean</p>
                <Badge
                  variant={mockUserPreferences.oxiclean ? "default" : "outline"}
                >
                  {mockUserPreferences.oxiclean ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Starch Level</p>
                <p className="text-sm">{mockUserPreferences.starchLevel}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Drying Method</p>
                <p className="text-sm">
                  {mockUserPreferences.dryingMethod.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Ironing Level</p>
                <p className="text-sm">{mockUserPreferences.ironingLevel}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Special Notes</p>
              <p className="text-sm">{mockUserPreferences.specialNotes}</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreferencesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
