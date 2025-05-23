import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import Header from '@/components/layout/Header'
import { CheckCircle } from 'lucide-react'

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Confirmation Content */}
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-secondary-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-secondary-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Confirmation
          </h1>

          <div className="text-gray-600 space-y-4 mb-8">
            <p>
              Confirmation message goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ut metus quis mi sodales consectetur. 
              Vivamus neque ligula, consectetur et orci congue, aliquam varius ligula. Aenean faucibus, urna vel congue commodo, orci tellus cursus 
              metus, nec efficitur arcu nisl et justo. Morbi ut arcu ac metus tempus bibendum et ante neque. Sint aliquam dolor lacus, ut facilisis sem sagittis 
              nulla. Maecenas vehicular aliquam tellus id ornare. Suspendisse efficitur metus sit porttitor id. Aliquam pellentesque cursus tellus. 
              Pellentesque sodales, risus ut sollicitudin porttitor, odio libero accumsan nibh, interdum tristique nisl tellus eu est. Nulla nec ante mollis, imperdiet tortor id, tempor nunc.
            </p>
            <p>
              In velit libero, molestie in nisl quis, vulputate consequat ante. Nunc quis sem sit amet tellus bibendum imperdiet vitae eget sem. Aenean 
              suscipit faucibus dapibus.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
            >
              Back to Marketplace
            </Button>
            <Button
              variant="synmax"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Launch Product Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}