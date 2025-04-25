
import { useData, Student } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TopStudents() {
  const { getTopStudents } = useData();
  const topStudents = getTopStudents(10);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy size={20} className="mr-2 text-yellow-500" />
          Top Performing Students
        </CardTitle>
        <CardDescription>Students with the highest average scores</CardDescription>
      </CardHeader>
      <CardContent>
        {topStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No student submissions recorded yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead>Exams Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topStudents.map((student, index) => (
                <TableRow key={student.id} className={index < 3 ? "bg-yellow-50" : ""}>
                  <TableCell className="font-bold">
                    {index === 0 ? (
                      <Badge className="bg-yellow-500 text-white">
                        <Medal size={16} className="mr-1" /> 1st
                      </Badge>
                    ) : index === 1 ? (
                      <Badge className="bg-gray-400 text-white">
                        <Medal size={16} className="mr-1" /> 2nd
                      </Badge>
                    ) : index === 2 ? (
                      <Badge className="bg-amber-700 text-white">
                        <Medal size={16} className="mr-1" /> 3rd
                      </Badge>
                    ) : (
                      `${index + 1}th`
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    {student.examsTaken > 0 
                      ? `${(student.totalScore / student.examsTaken).toFixed(2)}%` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{student.totalScore.toFixed(2)}</TableCell>
                  <TableCell>{student.examsTaken}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
