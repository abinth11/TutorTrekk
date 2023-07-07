import React, { useEffect, useState } from "react";
import { getQuizzesByLesson } from "../../../../api/endpoints/course/course";
import { toast } from "react-toastify";
import {
  Question,
  Option,
} from "../../../../api/types/apiResponses/apiResponseQuizzes";

const Quizzes: React.FC<{ lessonId: string | undefined }> = ({ lessonId }) => {
  const [quizzes, setQuizzes] = useState<Question[]>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(
    undefined
  );
  const [nextClicked, setNextClicked] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<
    boolean | undefined
  >(undefined);
  const [score, setScore] = useState<number>(0);

  const fetchQuizzes = async (lessonId: string) => {
    try {
      const response = await getQuizzesByLesson(lessonId);
      setQuizzes(response.data.questions);
    } catch (error: any) {
      toast.error(error.data.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchQuizzes(lessonId);
    }
  }, [lessonId]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleNextQuestion = () => {
    setNextClicked(true);

    const currentQuestion = quizzes![currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(
      (option) => option._id === selectedOptionId
    );

    if (selectedOption) {
      setAnsweredCorrectly(selectedOption.isCorrect);
      if (selectedOption.isCorrect) {
        setScore((prevScore) => prevScore + 1);
      }
    }

    setTimeout(() => {
      setSelectedOptionId(undefined);
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setNextClicked(false);
      setAnsweredCorrectly(undefined);
    }, 1000);
  };

  if (currentQuestionIndex === quizzes?.length) {
    return (
      <div className='flex flex-col items-center justify-center h-auto mb-5'>
        <div>
          <h2 className='text-xl font-semibold mt-3'>
            Congrats! your score is...{score}/{quizzes.length}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className=' min-h-screen '>
      <h2 className='text-xl ml-4 p-1 font-bold mb-4'>Questions({quizzes?.length})</h2>
      <div className=' mx-auto px-4'>
        {quizzes?.length ? (
          <div className='w-full  shadow-sm border-gray-100 border-2 rounded-lg px-8 py-6'>
            <p className='text-lg mb-6'>
              {quizzes[currentQuestionIndex]?.question}
            </p>
            <ul className='space-y-4'>
              {quizzes[currentQuestionIndex]?.options.map((option: Option) => (
                <li
                  key={option._id}
                  onClick={() => handleOptionSelect(option._id)}
                  className={`${
                    selectedOptionId === option._id
                      ? nextClicked
                        ? answeredCorrectly
                          ? "bg-green-400 text-white"
                          : "bg-red-400 text-white"
                        : "bg-blue-400 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  } rounded-lg p-4 w-1/2 cursor-pointer transition-colors duration-200`}
                >
                  {option.option}
                </li>
              ))}
            </ul>
            {selectedOptionId && (
              <button
                onClick={handleNextQuestion}
                className='bg-blue-500 text-white py-2 px-4 mt-6 rounded-lg hover:bg-blue-600 transition-colors duration-200'
              >
                Next
              </button>
            )}
          </div>
        ) : (
          <p className='text-lg text-center'>
            No quizzes available for this lesson.
          </p>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
