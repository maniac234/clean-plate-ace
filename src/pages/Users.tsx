import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon } from "lucide-react";

interface UserRow {
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      // Get roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (!profiles) {
        setLoading(false);
        return;
      }

      const roleMap = new Map<string, string>();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role));

      const merged: UserRow[] = profiles.map((p) => ({
        user_id: p.user_id,
        full_name: p.full_name,
        email: "", // will be filled if available
        role: roleMap.get(p.user_id) || "employee",
      }));

      setUsers(merged);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UsersIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Usuários</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Papel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">
                    {u.full_name || "Sem nome"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role === "admin" ? "Administrador" : "Funcionário"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
