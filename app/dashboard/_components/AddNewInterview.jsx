"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on Job Position, Job Description and Years of Experience give us ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} Interview question along with Answer in JSON format, Give us question and Answer field on JSON,Each question and answer should be in the format:
  {
    "question": "Your question here",
    "answer": "Your answer here"
  }`;

    try {
      const result = await chatSession.sendMessage(inputPrompt);
      const responseText = await result.response.text();
      console.log("🚀 ~ file: AddNewInterview.jsx:41 ~ onSubmit ~ responseText:", responseText)
      
      // Improved JSON parsing logic
      // Find any JSON-like structure in the response
      let jsonResponsePart;
      try {
        // First try to find an array pattern
        const jsonMatch = responseText.match(/\[(\s*\{.*\}\s*,?)*\]/s);
        if (jsonMatch) {
          jsonResponsePart = jsonMatch[0];
        } else {
          // If no array found, try to extract the entire JSON structure
          const startBracket = responseText.indexOf('[');
          const endBracket = responseText.lastIndexOf(']');
          
          if (startBracket !== -1 && endBracket !== -1 && startBracket < endBracket) {
            jsonResponsePart = responseText.substring(startBracket, endBracket + 1);
          } else {
            throw new Error("No valid JSON array found in the response");
          }
        }
        
        console.log("🚀 ~ file: AddNewInterview.jsx:43 ~ onSubmit ~ jsonResponsePart:", jsonResponsePart);
        
        // Try to parse the JSON, with error handling for malformed JSON
        let mockResponse;
        try {
          mockResponse = JSON.parse(jsonResponsePart.trim());
        } catch (parseError) {
          // Try to clean up common JSON issues
          const cleanedJson = jsonResponsePart
            .replace(/(\r\n|\n|\r)/gm, " ") // Remove line breaks
            .replace(/\s+/g, " ")          // Normalize whitespace
            .replace(/,\s*]/g, "]")        // Remove trailing commas
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are double-quoted
            .replace(/\\/g, "\\\\");       // Escape backslashes
          
          mockResponse = JSON.parse(cleanedJson);
        }
        
        console.log("🚀 ~ file: AddNewInterview.jsx:45 ~ onSubmit ~ mockResponse:", mockResponse);
        setJsonResponse(mockResponse);
        const jsonString = JSON.stringify(mockResponse);
        const res = await db.insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: jsonString,
            jobPosition: jobPosition,
            jobDesc: jobDescription,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format('DD-MM-YYYY'),
          }).returning({ mockId: MockInterview.mockId });
          setLoading(false);
          router.push(`dashboard/interview/${res[0]?.mockId}`);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        setLoading(false);
        throw new Error("Failed to parse the AI response into valid JSON");
      }
    } catch (error) {
      console.error("Error fetching interview questions:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="font-bold text-lg text-center">+ Add New</h1>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job Interviewing
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={onSubmit}>
              <div>
                <p>
                  Add details about your job position/role, job description, and
                  years of experience
                </p>
                <div className="mt-7 my-3">
                  <label>Job Role/Job Position</label>
                  <Input
                    placeholder="Ex. Full Stack Developer"
                    required
                    onChange={(e) => setJobPosition(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Job Description/Tech Stack (In short)</label>
                  <Textarea
                    placeholder="Ex. React, Angular, NodeJs, MySql etc"
                    required
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div className="my-3">
                  <label>Years of Experience</label>
                  <Input
                    placeholder="Ex. 5"
                    type="number"
                    min="1"
                    max="70"
                    required
                    onChange={(e) => setJobExperience(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-5 justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" /> Generating from AI
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
